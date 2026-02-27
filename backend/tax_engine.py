import pandas as pd
import json
import os
from dotenv import load_dotenv

# Optional: LLM imports (google-generativeai or openai)
import google.generativeai as genai

load_dotenv()

def analyze_financials(df: pd.DataFrame) -> dict:
    """
    Analyzes transactions to compute total income, expenses, monthly surplus, 
    and detects insurance/investments.
    """
    # Assuming 1 year of data
    total_income = df['Credit'].sum()
    total_expenses = df['Debit'].sum()
    monthly_surplus = (total_income - total_expenses) / 12 if total_income > total_expenses else 0
    
    # Categorize detected investments by summing debits in respective categories
    investments = {
        "80C_eligible": df[df['Category'] == 'PPF']['Debit'].sum() + df[df['Category'] == 'Mutual Fund (ELSS)']['Debit'].sum() + df[df['Category'] == 'Life Insurance']['Debit'].sum(),
        "80D_eligible": df[df['Category'] == 'Health Insurance']['Debit'].sum(),
        "80CCD_eligible": df[df['Category'] == 'NPS']['Debit'].sum()
    }
    
    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "monthly_surplus": round(monthly_surplus, 2),
        "detected_investments": investments
    }

def calculate_tax_gaps(financials: dict) -> dict:
    """
    Calculates unused limits for Section 80C, 80D, and 80CCD.
    """
    # Max limits
    LIMIT_80C = 150000
    LIMIT_80D = 25000  # assuming base limit for non-senior
    LIMIT_80CCD = 50000
    
    invested = financials["detected_investments"]
    
    gap_80c = max(0, LIMIT_80C - invested["80C_eligible"])
    gap_80d = max(0, LIMIT_80D - invested["80D_eligible"])
    gap_80ccd = max(0, LIMIT_80CCD - invested["80CCD_eligible"])
    
    return {
        "80C_gap": round(gap_80c, 2),
        "80D_gap": round(gap_80d, 2),
        "80CCD_gap": round(gap_80ccd, 2),
        "total_tax_saving_opportunity": round(gap_80c + gap_80d + gap_80ccd, 2)
    }

def generate_recommendations(profile: dict, financials: dict, tax_gaps: dict) -> tuple:
    """
    Uses multi-factor scoring to recommend investment categories and suggested monthly amount.
    """
    recommendations = []
    
    # Analyze Risk & Age
    age = profile.get("age", 30)
    risk = profile.get("risk_level", "Medium")
    surplus = financials["monthly_surplus"]
    
    # Recommend based on gaps
    if tax_gaps["80D_gap"] > 0:
        recommendations.append("Health Insurance")
        
    if tax_gaps["80C_gap"] > 0:
        if risk in ["High", "Medium"] and age < 45:
            recommendations.append("Long-term tax-saving investments (ELSS)")
        else:
            recommendations.append("Retirement savings (PPF)")
            
    if tax_gaps["80CCD_gap"] > 0:
        recommendations.append("Retirement savings (NPS)")
        
    # Emergency Fund Check
    if surplus > 0 and (financials["total_expenses"] / 12) * 6 > (financials["total_income"] * 0.1): 
        # simplistic check if they have enough liquid buffer, just suggest it always for safety if they have surplus
        if "Emergency fund" not in recommendations:
            recommendations.append("Emergency fund")
            
    # Wealth Growth Check
    if surplus > 20000 and risk in ["Medium", "High"] and tax_gaps["total_tax_saving_opportunity"] == 0:
        recommendations.append("Wealth growth funds")
        
    # Suggested Investment = 50% of monthly surplus goes towards covering tax gaps or wealth
    suggested_monthly = round(surplus * 0.5, 2) if surplus > 0 else 0
    
    # Fallback
    if not recommendations:
        recommendations = ["Continue current savings plan"]
        
    return list(set(recommendations)), suggested_monthly

def generate_ai_explanation(profile: dict, financials: dict, tax_gaps: dict, recommendations: list) -> str:
    """
    Calls an LLM API to generate a clear natural-language explanation.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "You have {surplus} monthly surplus and {gap} unused tax deductions. Increasing investments in {recs} can improve tax efficiency.".format(
            surplus=f"₹{financials['monthly_surplus']:,.0f}",
            gap=f"₹{tax_gaps['total_tax_saving_opportunity']:,.0f}",
            recs=", ".join(recommendations)
        )
        
    # Using Google Gemini API as requested
    genai.configure(api_key=api_key)
    
    # We use gemini-1.5-flash for general text tasks
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Act as a professional financial advisor. Given the user's financial profile, generate a maximum 3-sentence, 
        number-heavy, personalized natural-language explanation of their tax-saving opportunities. Speak directly to "You".
        
        User Profile: Age {profile.get('age')}, Salary: ₹{profile.get('salary')}, Dependents: {profile.get('dependents')}
        Monthly Surplus: ₹{financials['monthly_surplus']}
        Unused Tax Deductions: ₹{tax_gaps['total_tax_saving_opportunity']}
        Recommended Actions: {', '.join(recommendations)}
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return "You have {surplus} monthly surplus and {gap} unused tax deductions. Increasing investments in {recs} can improve tax efficiency.".format(
            surplus=f"₹{financials['monthly_surplus']:,.0f}",
            gap=f"₹{tax_gaps['total_tax_saving_opportunity']:,.0f}",
            recs=", ".join(recommendations)
        )

def process_user_data(df: pd.DataFrame, profile: dict) -> str:
    """
    Main pipeline function that processes data and returns the JSON structure.
    """
    try:
        financials = analyze_financials(df)
        gaps = calculate_tax_gaps(financials)
        recs, monthly = generate_recommendations(profile, financials, gaps)
        ai_text = generate_ai_explanation(profile, financials, gaps, recs)
        
        output = {
            "financial_summary": financials,
            "tax_gap_summary": gaps,
            "recommendations": recs,
            "suggested_monthly_investment": monthly,
            "ai_explanation": ai_text
        }
        
        return json.dumps(output, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    # Test script with the generated data
    print("Testing Tax Engine...")
    try:
        df = pd.read_csv("c:\\Users\\dwara\\Downloads\\b_czZzU9wmRLk-1772190024275\\backend\\transactions.csv")
        # dummy profile matching generator
        profile = {'age': 30, 'salary': 1200000, 'marital_status': 'Single', 'dependents': 0, 'risk_level': 'Medium'}
        
        result_json = process_user_data(df, profile)
        print(result_json)
    except Exception as e:
        print(f"Failed to run test: {e}")
