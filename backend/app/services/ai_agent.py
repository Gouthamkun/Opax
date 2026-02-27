import os
from google import genai
from pydantic import BaseModel
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class AIAgent:
    def __init__(self):
        # We will initialize the client with the API key from the environment
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            
        self.system_prompt = """
        You are OPAX, an expert Tax Advisor and Assistant specializing in the Indian Tax System for FY 2024-25.
        You are highly professional, analytical, and friendly.
        You provide clear, mathematical answers and actionable strategies to help users optimize their taxes.
        Always consider the user's specific context when provided to give highly personalized advice.
        If a user asks a general question, answer it accurately based on Indian tax laws.
        Keep your responses concise, structured, and easy to read. Use bullet points or bold text for emphasis.
        """

    def generate_response(self, message: str, context: Dict[str, Any] = None, history: List[Dict[str, str]] = None) -> str:
        if not self.client:
            return "I am currently in 'Demo Mode' because the GEMINI_API_KEY environment variable is missing. Please add your key to a .env file to enable my full tax-advisory capabilities."
            
        try:
            # Build the dynamic prompt with user context
            context_string = ""
            if context:
                context_string = f"\n\nUSER CONTEXT DATA:\n"
                if "salary" in context:
                    context_string += f"- Annual Income: ₹{context['salary']}\n"
                if "age" in context:
                    context_string += f"- Age: {context['age']}\n"
                if "tax_analysis" in context:
                    ta = context["tax_analysis"]
                    context_string += f"- Current Tax Savings (Old Regime): ₹{ta.get('savings', 0)}\n"
                    context_string += f"- Recommended Regime: {ta.get('recommended', 'Unknown')}\n"
                    if "deductions" in ta and "80C" in ta["deductions"]:
                        gap = 150000 - ta["deductions"]["80C"].get("allowed", 0)
                        context_string += f"- Remaining 80C Investment Limit: ₹{gap}\n"

            # Prepare messages format for chat API
            messages = [{"role": "system", "text": self.system_prompt + context_string}]
            
            # Append previous history if any
            if history:
                for h in history:
                    # Map generic roles to genai specific if needed, standard is user/model
                    role = h.get("role")
                    if role == "assistant":
                        role = "model"
                    messages.append({"role": role, "text": h.get("content", "")})
                    
            messages.append({"role": "user", "text": message})

            # Call the GenAI API
            # Note: The new SDK supports chat sessions natively, but using generate_content is easier for stateless context injection
            
            # Format raw messages array for generate_content
            contents = []
            for msg in messages:
                # System instructions are handled differently in the new SDK
                pass
                
            # Using basic generation with prepended system instruction for simplicity
            full_prompt = self.system_prompt + context_string + "\n\n"
            
            if history:
                full_prompt += "--- Conversation History ---\n"
                for h in history:
                    full_prompt += f"{h['role'].capitalize()}: {h['content']}\n"
                full_prompt += "----------------------------\n\n"
                
            full_prompt += f"User: {message}\nAssistant:"
            
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=full_prompt
            )
            return response.text
            
        except Exception as e:
            import traceback
            error_msg = traceback.format_exc()
            print(f"Error generating AI response:\n{error_msg}")
            
            error_str = str(e).lower()
            if "quota" in error_str or "429" in error_str or "exhausted" in error_str:
                return "Your Gemini API Key is active, but it is currently hitting a temporary quota limit (Rate Limit). This happens frequently with new or free-tier keys. Please wait 1-2 minutes and try again - Google will automatically reset your limit!"
            
            return "I apologize, but I am currently experiencing technical difficulties. Please try again in 30 seconds."

# Create a singleton instance
ai_agent = AIAgent()
