import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_user_profile():
    """Generates a synthetic user profile dictionary."""
    return {
        "age": random.randint(25, 60),
        "salary": random.choice([800000, 1200000, 1800000, 2500000, 3500000]),
        "marital_status": random.choice(["Single", "Married"]),
        "dependents": random.randint(0, 3),
        "risk_level": random.choice(["Low", "Medium", "High"])
    }

def generate_transactions(num_transactions=100, save_path="transactions.csv"):
    """
    Generates a synthetic dataframe of bank transactions over the last year.
    Matches the schema: Date, Description, Debit, Credit, Balance, Category.
    """
    
    categories = [
        "Salary", "Groceries", "Rent", "Utilities", "Dining", 
        "Entertainment", "Health Insurance", "Life Insurance", 
        "Mutual Fund (ELSS)", "PPF", "NPS", "Travel", "Misc"
    ]
    
    # Weights for random category selection (excluding Salary which is fixed)
    expense_categories = categories[1:]
    weights = [0.2, 0.2, 0.1, 0.15, 0.1, 0.05, 0.05, 0.05, 0.05, 0.02, 0.02, 0.01]
    
    data = []
    base_date = datetime.now() - timedelta(days=365)
    current_balance = random.uniform(50000, 200000)
    
    for i in range(num_transactions):
        # Transaction date
        days_offset = sorted(random.sample(range(365), num_transactions))[i]
        t_date = base_date + timedelta(days=days_offset)
        
        # Determine if it's a salary deposit or an expense
        # Let's say every ~30 days is salary
        if (i % (num_transactions // 12 + 1)) == 0:
            category = "Salary"
            description = "EMPLOYER SALARY NEFT"
            credit = round(random.uniform(60000, 250000), 2)
            debit = 0.0
        else:
            category = random.choices(expense_categories, weights=weights)[0]
            description = f"PAYMENT TO {category.upper()}"
            
            # Special amounts for specific categories
            if category == "Rent":
                debit = round(random.uniform(15000, 40000), 2)
            elif category in ["Health Insurance", "Life Insurance"]:
                debit = round(random.uniform(5000, 25000), 2)
            elif category in ["Mutual Fund (ELSS)", "PPF", "NPS"]:
                debit = round(random.uniform(5000, 50000), 2)
            else:
                debit = round(random.uniform(100, 5000), 2)
            
            credit = 0.0
            
        # Update balance
        current_balance += credit - debit
        
        data.append({
            "Date": t_date.strftime("%Y-%m-%d"),
            "Description": description,
            "Debit": debit,
            "Credit": credit,
            "Balance": round(current_balance, 2),
            "Category": category
        })
        
    df = pd.DataFrame(data)
    
    if save_path:
        df.to_csv(save_path, index=False)
        print(f"Generated {num_transactions} transactions and saved to {save_path}")
        
    return df

if __name__ == "__main__":
    profile = generate_user_profile()
    print("Generated User Profile:")
    print(profile)
    
    print("\nGenerating Transactions...")
    df = generate_transactions(num_transactions=150, save_path="c:\\Users\\dwara\\Downloads\\b_czZzU9wmRLk-1772190024275\\backend\\transactions.csv")
    print("\nSample Data:")
    print(df.head())
