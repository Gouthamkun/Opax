import streamlit as st
import pandas as pd
import json
import plotly.express as px
from tax_engine import process_user_data

st.set_page_config(page_title="OpenTax AI - Tax Optimization Advisor", page_icon="📈", layout="wide")

st.title("📈 OpenTax AI - Tax Optimization Dashboard")
st.markdown("Analyze your bank transactions to generate personalized tax-saving and financial recommendations.")

# Sidebar Controls
st.sidebar.header("User Profile")
age = st.sidebar.number_input("Age", min_value=18, max_value=100, value=30)
salary = st.sidebar.number_input("Annual Salary (₹)", min_value=100000, value=1200000)
dependents = st.sidebar.number_input("Dependents", min_value=0, max_value=10, value=0)
risk_level = st.sidebar.selectbox("Risk Tolerance", ["Low", "Medium", "High"], index=1)

profile = {
    "age": age,
    "salary": salary,
    "dependents": dependents,
    "risk_level": risk_level
}

st.sidebar.markdown("---")
st.sidebar.header("Upload Data")
uploaded_file = st.sidebar.file_uploader("Upload Bank Transactions (CSV)", type="csv")

if uploaded_file is not None or st.sidebar.button("Use Sample Data"):
    with st.spinner("Analyzing Financials & Generating AI Explanations..."):
        if uploaded_file is not None:
            df = pd.read_csv(uploaded_file)
        else:
            try:
                df = pd.read_csv("c:\\Users\\dwara\\Downloads\\b_czZzU9wmRLk-1772190024275\\backend\\transactions.csv")
            except FileNotFoundError:
                st.error("Sample data not found. Please run `python data_generator.py` first.")
                st.stop()
        
        # Call the engine
        json_output = process_user_data(df, profile)
        data = json.loads(json_output)
        
        if "error" in data:
            st.error(f"An error occurred: {data['error']}")
            st.stop()
            
        financials = data["financial_summary"]
        gaps = data["tax_gap_summary"]
        recs = data["recommendations"]
        suggestion = data["suggested_monthly_investment"]
        ai_exp = data["ai_explanation"]
        
        # Display Summary Metrics
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Income", f"₹{financials['total_income']:,.0f}")
        col2.metric("Total Expenses", f"₹{financials['total_expenses']:,.0f}")
        col3.metric("Monthly Surplus", f"₹{financials['monthly_surplus']:,.0f}")
        col4.metric("Unused Tax Savings", f"₹{gaps['total_tax_saving_opportunity']:,.0f}", delta=-gaps['total_tax_saving_opportunity'], delta_color="inverse")
        
        st.markdown("---")
        
        # Charts Row
        c1, c2 = st.columns(2)
        
        with c1:
            st.subheader("Income vs Expenses")
            fig1 = px.pie(
                values=[financials["total_expenses"], financials["monthly_surplus"] * 12], 
                names=["Expenses", "Yearly Surplus"],
                hole=0.4,
                color_discrete_sequence=["#ef4444", "#22c55e"]
            )
            st.plotly_chart(fig1, use_container_width=True)
            
        with c2:
            st.subheader("Tax Deduction Utilization")
            limits = {"80C": 150000, "80D": 25000, "80CCD": 50000}
            utilized = {
                "80C": financials["detected_investments"]["80C_eligible"],
                "80D": financials["detected_investments"]["80D_eligible"],
                "80CCD": financials["detected_investments"]["80CCD_eligible"]
            }
            
            tax_df = pd.DataFrame({
                "Category": ["Sec 80C", "Sec 80D", "Sec 80CCD"],
                "Utilized": [min(utilized["80C"], limits["80C"]), min(utilized["80D"], limits["80D"]), min(utilized["80CCD"], limits["80CCD"])],
                "Remaining Gap": [gaps["80C_gap"], gaps["80D_gap"], gaps["80CCD_gap"]]
            })
            
            fig2 = px.bar(
                tax_df, 
                x="Category", 
                y=["Utilized", "Remaining Gap"], 
                title="Tax Limits Breakdown",
                color_discrete_map={"Utilized": "#3b82f6", "Remaining Gap": "#facc15"}
            )
            st.plotly_chart(fig2, use_container_width=True)

        st.markdown("---")
        
        # Recommendations & AI
        st.header("💡 Personalized Strategy")
        
        col_rec, col_ai = st.columns([1, 1])
        with col_rec:
            st.subheader("Actionable Recommendations")
            for r in recs:
                st.markdown(f"✅ **{r}**")
                
            st.info(f"**Suggested Monthly Investment:** ₹{suggestion:,.0f}")
            
        with col_ai:
            st.subheader("AI Financial Advisor")
            st.success(ai_exp)
            
        # Raw Data Output
        with st.expander("View Raw JSON Output (For Frontend Integration)"):
            st.json(data)

else:
    st.info("👈 Please input your profile and upload transactions or use the sample data to begin analysis.")
