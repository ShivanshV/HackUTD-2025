"""
AI Agent Service - Nemotron-Powered Toyota Assistant

Architecture:
1. Nemotron extracts user needs from natural language
2. Calls catalog_scoring_service with structured profile
3. Explains recommendations with personality and reasoning

This ensures:
- Grounded responses (no hallucinations about specs)
- Explainable recommendations (clear reasoning)
- Accurate data (from cars.json source of truth)
"""

from typing import List, Dict, Any, Optional
import json
import re
from openai import OpenAI  # OpenAI SDK used for Nemotron API (compatible format)
from app.models.chat import ChatMessage
from app.core.config import settings
from app.services.catalog_scoring import catalog_scoring_service
from app.services.financial_service import financial_service

class AIAgent:
    """AI Agent powered by NVIDIA Nemotron API + Toyota Catalog Service"""
    
    def __init__(self):
        """Initialize the Nemotron client and catalog service"""
        if settings.NEMOTRON_API_KEY:
            self.client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.NEMOTRON_API_KEY
            )
        else:
            self.client = None
        
        # Access to catalog scoring service
        self.catalog = catalog_scoring_service
    
    def _build_system_prompt(self) -> str:
        """Build comprehensive system prompt for Nemotron"""
        return """You are a knowledgeable Toyota vehicle advisor powered by real Toyota catalog data AND financial analysis tools.

Your job is to:
1. Understand what the user needs (budget, family size, commute, priorities)
2. Understand their financial situation (income, down payment, credit score)
3. Use the Toyota catalog to find the best matches
4. Evaluate affordability and provide realistic financial guidance
5. Explain recommendations clearly with specific reasons

IMPORTANT: You have access to tools that:
- Score Toyota vehicles based on user needs (budget, passengers, commute, terrain, features, priorities)
- Evaluate affordability based on financial profile (income, credit score, down payment)
- Calculate monthly payments and total cost of ownership
- Adjust scoring weights based on user priorities (fuel efficiency, performance, safety, etc.)

When a user asks about cars, extract:
- Vehicle requirements (budget, passengers, commute distance, terrain, features wanted, etc.)
- Financial information (income, down payment, credit score, loan term preference)

HANDLING AMBIGUOUS QUERIES:
If the user's query is unclear or missing critical information, ask clarifying questions in a friendly, conversational way.
Focus on what's needed to use the scoring and financial analysis tools effectively.

Be conversational, helpful, and always ground your recommendations in real data.
Never make up specifications or financial advice - only use what's calculated from the tools.
Be realistic about affordability - help users make smart financial decisions.

Available Toyota models include: Camry, Corolla, RAV4, Highlander, 4Runner, Tacoma, Tundra, Sienna, Sequoia, Prius, and their variants (hybrid, prime, etc.)."""
    
    def _convert_messages_to_nemotron_format(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Convert ChatMessage list to Nemotron API format"""
        formatted_messages = []
        
        # Add system message with tool context
        formatted_messages.append({
            "role": "system",
            "content": self._build_system_prompt()
        })
        
        # Convert chat history
        for msg in messages:
            formatted_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        return formatted_messages
    
    def _extract_user_profile(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Extract user profile from natural language query
        This is a simple extraction - Nemotron can enhance this later
        """
        profile = {}
        message_lower = message.lower()
        
        # Extract budget (exclude down payment amounts)
        # Handle different budget types: base price, total cost, OTD (out the door), after all costs
        has_down_context = 'down' in message_lower
        
        # Check for "total cost", "after all costs", "OTD", "out the door" - these mean TOTAL cost including taxes/fees
        is_total_cost = any(phrase in message_lower for phrase in [
            'after all costs', 'total cost', 'out the door', 'otd', 
            'including all', 'all included', 'total price', 'all costs included'
        ])
        
        budget_patterns = [
            r'budget.*?\$?(\d+)k?',  # "budget of $50k" or "budget $50k"
            r'budget.*?\$(\d{4,6})',  # "budget $50000"
            r'\$?(\d+)k\s+(?:budget|max|maximum)',  # "$50k budget"
            r'(?:under|up\s+to|max).*?\$?(\d+)k(?!.*down)',  # "under $50k" but not if near "down"
            r'\$?(\d+)k?\s+(?:for|after|including).*?(?:all|total|costs)',  # "$33k for all costs"
        ]
        for pattern in budget_patterns:
            match = re.search(pattern, message_lower)
            if match:
                # Only extract if it's clearly a budget reference, not down payment
                match_start = message_lower.find(match.group(0))
                # Check if "down" appears nearby (within 20 chars)
                nearby_text = message_lower[max(0, match_start-20):match_start+50]
                if 'down' not in nearby_text:
                    budget = match.group(1)
                    if 'k' in match.group(0).lower():
                        budget_value = int(budget) * 1000
                    else:
                        budget_value = int(budget)
                    
                    # If it's "total cost" or "after all costs", mark it as total cost
                    # For total cost, we should use a lower base price (subtract ~10-15% for taxes/fees)
                    if is_total_cost:
                        # Mark as total cost budget - will need to adjust base price expectations
                        profile['budget_max'] = budget_value
                        profile['budget_is_total_cost'] = True
                        # Estimate base MSRP from total cost (assume ~12% for taxes/fees)
                        # This is an approximation - actual can vary by state
                        profile['budget_max_estimated_base'] = int(budget_value * 0.88)
                    else:
                        profile['budget_max'] = budget_value
                        profile['budget_is_total_cost'] = False
                    break
        
        # Check if budget is flexible
        if any(phrase in message_lower for phrase in ['flexible', 'can go higher', 'not strict', 'can adjust']):
            profile['budget_flexible'] = True
        
        # Extract passengers/family size
        passenger_patterns = [
            r'(\d+)\s*(?:people|passengers|seats)',
            r'family of (\d+)',
            r'seat(?:s|ing) for (\d+)',
        ]
        for pattern in passenger_patterns:
            match = re.search(pattern, message_lower)
            if match:
                profile['passengers'] = int(match.group(1))
                break
        
        # Extract commute distance
        commute_patterns = [
            r'commute.*?(\d+)\s*(?:miles|mi)',
            r'drive.*?(\d+)\s*(?:miles|mi)',
        ]
        for pattern in commute_patterns:
            match = re.search(pattern, message_lower)
            if match:
                profile['commute_miles'] = int(match.group(1))
                break
        
        # Detect family/children
        if any(word in message_lower for word in ['family', 'kids', 'children', 'child', 'baby']):
            profile['has_children'] = True
        
        # Detect terrain preferences
        if any(word in message_lower for word in ['offroad', 'off-road', 'trail', 'mountain']):
            profile['terrain'] = 'offroad'
        elif any(word in message_lower for word in ['highway', 'freeway', 'long distance']):
            profile['terrain'] = 'highway'
        elif any(word in message_lower for word in ['city', 'urban', 'downtown']):
            profile['terrain'] = 'city'
        
        # Extract features wanted
        features = []
        feature_keywords = {
            'awd': ['awd', 'all wheel', 'all-wheel', '4wd', 'four wheel'],
            'hybrid': ['hybrid', 'electric', 'plug-in', 'eco'],
            '3_row_seating': ['3 row', 'three row', '7 seat', '8 seat'],
            'adaptive_cruise': ['adaptive cruise', 'cruise control'],
            'leather_seats': ['leather'],
            'sunroof': ['sunroof', 'panoramic'],
        }
        for feature, keywords in feature_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                features.append(feature)
        if features:
            profile['features_wanted'] = features
        
        # Extract priorities - check for explicit priority statements
        priorities = []
        
        # Check for explicit priority statements ("most important", "top priority", "priority is")
        priority_phrases = [
            r'(?:most|top|main|primary|#1|number one).*?priority.*?is.*?(trunk|cargo|space|storage|price|cost|budget|fuel|mpg|safety|performance|power)',
            r'priority.*?is.*?(trunk|cargo|space|storage|price|cost|budget|fuel|mpg|safety|performance|power)',
            r'(?:care|need|want).*?most.*?(?:about|is).*?(trunk|cargo|space|storage|price|fuel|safety|performance)',
        ]
        
        top_priority = None
        for pattern in priority_phrases:
            match = re.search(pattern, message_lower)
            if match:
                priority_word = match.group(1).lower()
                if priority_word in ['trunk', 'cargo', 'space', 'storage']:
                    top_priority = 'space'
                elif priority_word in ['fuel', 'mpg', 'gas', 'efficient']:
                    top_priority = 'fuel_efficiency'
                elif priority_word in ['safety', 'safe']:
                    top_priority = 'safety'
                elif priority_word in ['performance', 'power']:
                    top_priority = 'performance'
                elif priority_word in ['price', 'cost', 'budget']:
                    top_priority = 'budget'
                break
        
        # Extract all priorities mentioned
        if any(word in message_lower for word in ['fuel', 'mpg', 'gas', 'efficient', 'economy']):
            priorities.append('fuel_efficiency')
        if any(word in message_lower for word in ['safe', 'safety']):
            priorities.append('safety')
        # Enhanced space detection - trunk, cargo, storage, equipment
        if any(word in message_lower for word in ['space', 'spacious', 'room', 'cargo', 'trunk', 'storage', 'equipment', 'luggage', 'gear']):
            priorities.append('space')
        if any(word in message_lower for word in ['performance', 'power', 'fast', 'sporty']):
            priorities.append('performance')
        
        # If top priority was detected, put it first
        if top_priority and top_priority in priorities:
            priorities.remove(top_priority)
            priorities.insert(0, top_priority)
        elif top_priority and top_priority not in priorities:
            priorities.insert(0, top_priority)
        
        if priorities:
            profile['priorities'] = priorities
            # Store top priority separately for emphasis
            if top_priority:
                profile['top_priority'] = top_priority
            # Convert priorities to weight adjustments (pass top_priority for higher weight)
            profile['weights'] = self._priorities_to_weights(priorities, top_priority=top_priority)
        
        # Detect ground clearance / suspension needs (potholes, speed bumps, rough roads)
        if any(phrase in message_lower for phrase in [
            'pothole', 'speed bump', 'speedbump', 'rough road', 'rough roads',
            'bumpy', 'uneven', 'ground clearance', 'clearance', 'suspension'
        ]):
            profile['needs_ground_clearance'] = True
            profile['terrain'] = 'rough_city'  # Special terrain type for rough city driving
        
        return profile if profile else None
    
    def _has_substantial_vehicle_preferences(self, user_profile: Optional[Dict[str, Any]]) -> bool:
        """
        Determine if user has provided enough vehicle preference information
        to make meaningful recommendations without financial info.
        
        Substantial preferences = at least 2 of:
        - Budget (or budget is flexible)
        - Passengers/family needs
        - Priorities (especially top priority)
        - Features wanted
        - Terrain/commute
        - Specific needs (ground clearance, cargo space, etc.)
        """
        if not user_profile:
            return False
        
        preference_count = 0
        
        # Budget (even if flexible, it's a preference)
        if user_profile.get("budget_max") or user_profile.get("budget_flexible"):
            preference_count += 1
        
        # Passengers/family
        if user_profile.get("passengers") or user_profile.get("has_children"):
            preference_count += 1
        
        # Priorities (especially if top priority is specified)
        if user_profile.get("priorities"):
            preference_count += 1
            # Top priority counts as extra substantial info
            if user_profile.get("top_priority"):
                preference_count += 0.5
        
        # Features wanted
        if user_profile.get("features_wanted"):
            preference_count += 1
        
        # Terrain/commute
        if user_profile.get("terrain") or user_profile.get("commute_miles"):
            preference_count += 1
        
        # Specific needs
        if user_profile.get("needs_ground_clearance"):
            preference_count += 1
        
        # If user has at least 2 substantial preferences, show results
        # If they have a top priority explicitly stated, that's even better
        return preference_count >= 2.0
    
    def _analyze_missing_information(
        self, 
        user_profile: Optional[Dict[str, Any]], 
        financial_profile: Optional[Dict[str, Any]],
        user_message: str
    ) -> Dict[str, Any]:
        """
        Analyze what information is missing and provide context for Nemotron to ask clarifying questions
        
        Returns:
            Dictionary with missing_info flags and suggested questions
        """
        missing_info = {
            "needs_budget": False,
            "needs_passengers": False,
            "needs_income": False,
            "needs_income_clarification": False,  # Income provided but unclear if monthly/yearly
            "ambiguous_income_amount": None,  # The ambiguous income amount
            "ambiguous_income_likely_annual": None,  # Whether it's likely annual
            "needs_credit": False,
            "needs_down_payment": False,
            "needs_priorities": False,
            "needs_features": False,
            "needs_commute": False,
            "suggested_questions": []
        }
        
        # Check vehicle preferences
        # IMPORTANT: Only mark as missing if NOT already provided in the profile
        if not user_profile:
            # No profile at all - everything is missing
            missing_info["needs_budget"] = True
            missing_info["needs_passengers"] = True
            missing_info["needs_priorities"] = True
            missing_info["needs_features"] = True
            missing_info["needs_commute"] = True
        else:
            # Profile exists - check each field individually
            # Only mark as missing if the field is NOT present or is None/empty
            budget_value = user_profile.get("budget_max")
            if budget_value is None or budget_value == 0:
                missing_info["needs_budget"] = True
            
            passengers_value = user_profile.get("passengers")
            if passengers_value is None or passengers_value == 0:
                missing_info["needs_passengers"] = True
            
            priorities_value = user_profile.get("priorities")
            if not priorities_value or (isinstance(priorities_value, list) and len(priorities_value) == 0):
                missing_info["needs_priorities"] = True
            
            # Check if features are provided (must be a non-empty list)
            features_value = user_profile.get("features_wanted")
            if not features_value or (isinstance(features_value, list) and len(features_value) == 0):
                missing_info["needs_features"] = True
            
            # Check if commute/terrain information is provided
            # If either terrain OR commute_miles is provided, we have commute info
            terrain_value = user_profile.get("terrain")
            commute_miles_value = user_profile.get("commute_miles")
            if not terrain_value and (commute_miles_value is None or commute_miles_value == 0):
                missing_info["needs_commute"] = True
        
        # Check financial information
        if not financial_profile:
            missing_info["needs_income"] = True
            missing_info["needs_credit"] = True
            missing_info["needs_down_payment"] = True
        else:
            # Check for ambiguous income (provided but unclear if monthly or yearly)
            if financial_profile.get("ambiguous_income"):
                missing_info["needs_income_clarification"] = True
                missing_info["ambiguous_income_amount"] = financial_profile.get("ambiguous_income")
                missing_info["ambiguous_income_likely_annual"] = financial_profile.get("ambiguous_income_likely_annual")
                # Don't set needs_income = True since we have the amount, just need clarification
            elif not financial_profile.get("annual_income") and not financial_profile.get("monthly_income"):
                missing_info["needs_income"] = True
            
            if not financial_profile.get("credit_score"):
                missing_info["needs_credit"] = True
            if not financial_profile.get("down_payment"):
                missing_info["needs_down_payment"] = True
        
        # Build suggested questions based on what's missing
        # IMPORTANT: Only add questions for fields that are ACTUALLY marked as missing
        questions = []
        
        # Handle ambiguous income FIRST (takes priority)
        if missing_info["needs_income_clarification"]:
            ambiguous_amount = missing_info["ambiguous_income_amount"]
            likely_annual = missing_info["ambiguous_income_likely_annual"]
            
            # Format the amount nicely
            if ambiguous_amount >= 1000:
                amount_str = f"${ambiguous_amount:,}"
            else:
                amount_str = f"${ambiguous_amount}"
            
            if likely_annual is True:
                # Likely annual but should confirm
                questions.append(f"Is your income of {amount_str} per year or per month? (This helps calculate exact monthly payments)")
            elif likely_annual is False:
                # Likely monthly but should confirm
                questions.append(f"Is your income of {amount_str} per month or per year? (This helps calculate exact monthly payments)")
            else:
                # Completely unclear
                questions.append(f"Is your income of {amount_str} per month or per year? (This is important for calculating monthly payments accurately)")
        
        # If query seems to be about affordability but missing financial info
        affordability_keywords = ['afford', 'budget', 'payment', 'cost', 'price', 'expensive', 'cheap']
        is_affordability_query = any(keyword in user_message.lower() for keyword in affordability_keywords)
        
        if is_affordability_query:
            # Only ask about income if it's missing AND not already being clarified
            if missing_info["needs_income"] and not missing_info["needs_income_clarification"]:
                questions.append("What is your monthly or annual income?")
            # Only ask about credit if missing
            if missing_info["needs_credit"]:
                questions.append("What is your credit score range (excellent, good, fair, or a specific number)?")
            # Only ask about down payment if missing
            if missing_info["needs_down_payment"]:
                questions.append("How much can you put down as a down payment?")
        else:
            # For non-affordability queries, still ask about financial info if completely missing
            # But prioritize vehicle preferences
            if missing_info["needs_income"] and not missing_info["needs_income_clarification"]:
                questions.append("What is your monthly or annual income? (optional, but helps with affordability analysis)")
            if missing_info["needs_credit"]:
                questions.append("What is your credit score? (optional, but helps calculate accurate payments)")
        
        # Vehicle preference questions - ONLY ask if marked as missing
        # Double-check: don't ask about things that are already in the profile
        if missing_info["needs_passengers"]:
            # Verify it's actually missing (safety check)
            if not user_profile or not user_profile.get("passengers"):
                questions.append("How many passengers do you need to seat regularly?")
        
        if missing_info["needs_budget"]:
            # Verify it's actually missing (safety check)
            if not user_profile or not user_profile.get("budget_max"):
                questions.append("What is your budget range for the vehicle?")
        
        if missing_info["needs_priorities"]:
            # Verify it's actually missing (safety check)
            if not user_profile or not user_profile.get("priorities"):
                questions.append("What are your priorities? (fuel efficiency, performance, space, safety, etc.)")
        
        if missing_info["needs_commute"]:
            # Verify it's actually missing (safety check)
            if not user_profile or (not user_profile.get("terrain") and not user_profile.get("commute_miles")):
                questions.append("What type of driving will you be doing? (city, highway, off-road, or commute distance)")
        
        if missing_info["needs_features"]:
            # Verify it's actually missing (safety check)
            if not user_profile or not user_profile.get("features_wanted"):
                questions.append("Are there any specific features you want? (AWD, hybrid, 3rd row seating, etc.)")
        
        missing_info["suggested_questions"] = questions
        
        return missing_info
    
    def _extract_profiles_from_conversation(self, messages: List[ChatMessage]) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Extract user and financial profiles from entire conversation history.
        Most recent information takes precedence over earlier information.
        
        This handles cases where users correct themselves:
        - "I have bad credit" → later: "Actually, my credit is good" → Uses "good"
        - "Budget $30k" → later: "Budget $40k" → Uses $40k
        
        Args:
            messages: Full conversation history
            
        Returns:
            (user_profile, financial_profile) - Merged profiles with latest values
        """
        user_profile = {}
        financial_profile = {}
        
        if not messages:
            return (user_profile if user_profile else None, financial_profile if financial_profile else None)
        
        # Process ALL user messages in chronological order
        # Later messages override earlier ones for conflicting fields
        for msg in messages:
            if msg.role == "user":
                # Extract from this message
                current_user = self._extract_user_profile(msg.content)
                current_financial = self._extract_financial_profile(msg.content)
                
                # Merge user profile (later values override earlier ones)
                if current_user:
                    # For conflicting fields, prefer the newer value
                    for key, value in current_user.items():
                        if key == "weights" and value:
                            # Merge weights dictionaries (newer weights override)
                            if "weights" not in user_profile:
                                user_profile["weights"] = {}
                            user_profile["weights"].update(value)
                        elif key == "priorities" and value:
                            # For priorities: if new priorities are provided, they REPLACE old ones
                            # (User might change their mind: "fuel efficiency" → "performance")
                            user_profile["priorities"] = value  # Replace, don't merge
                        elif key == "features_wanted" and value:
                            # For features: if new features provided, they REPLACE old ones
                            # (User might clarify: "AWD" → "AWD and hybrid")
                            user_profile["features_wanted"] = value  # Replace, don't merge
                        else:
                            # For other fields (budget, passengers, commute, etc.), newer value overrides older
                            # This handles corrections: "$30k" → "$40k", "5 people" → "7 people"
                            user_profile[key] = value
                
                # Merge financial profile (later values override earlier ones)
                if current_financial:
                    # For all financial fields, newer value ALWAYS overrides older
                    # This handles corrections like:
                    # - "bad credit" → "good credit" → Uses "good"
                    # - "$50k income" → "$60k income" → Uses $60k
                    # - "$3k down" → "$8k down" → Uses $8k
                    for key, value in current_financial.items():
                        # Store previous value to detect changes
                        previous_value = financial_profile.get(key)
                        
                        # New value overrides old value
                        financial_profile[key] = value
                        
                        # If value changed, this is a correction/update
                        # (We could log this, but for now just use the new value)
        
        # Return None if empty to maintain existing logic
        return (
            user_profile if user_profile else None,
            financial_profile if financial_profile else None
        )
    
    def _should_show_more_results(self, messages: List[ChatMessage]) -> tuple[bool, int]:
        """
        Detect if user is asking for more results and determine how many to show
        
        Returns:
            (should_show_more, num_results) - Whether to show more and how many
        """
        if not messages:
            return (False, 8)  # Default 8 results
        
        # Check the latest user message
        latest_message = messages[-1].content.lower() if messages else ""
        
        # Phrases that indicate wanting more results
        more_phrases = [
            'show more',
            'more options',
            'more cars',
            'more results',
            'more vehicles',
            'see more',
            'show me more',
            'want more',
            'need more',
            'give me more',
            'all options',
            'all cars',
            'show all',
            'see all',
        ]
        
        # Check if any "more" phrase is present
        wants_more = any(phrase in latest_message for phrase in more_phrases)
        
        # Determine number of results
        if wants_more:
            # Extract specific number if mentioned
            num_match = re.search(r'(\d+)\s*(?:more|options|cars|results)', latest_message)
            if num_match:
                requested_num = int(num_match.group(1))
                # If they say "show 5 more", add to default
                if 'more' in latest_message:
                    return (True, 8 + requested_num)
                else:
                    return (True, requested_num)
            
            # Check for "all" which means show many more
            if 'all' in latest_message:
                return (True, 25)  # Show up to 25 for "all"
            
            # Default "more" request - show 15 instead of 8
            return (True, 15)
        
        # Check conversation history for context
        # If this is a follow-up to showing results, might want more
        if len(messages) > 1:
            # Check if previous assistant message showed results
            prev_assistant = None
            for msg in reversed(messages[:-1]):  # Check all but the latest
                if msg.role == "agent":
                    prev_assistant = msg.content.lower()
                    break
            
            if prev_assistant and any(word in prev_assistant for word in ['affordable', 'options', 'recommendations', 'here are']):
                # Previous message showed results, and user might be asking for more
                if any(word in latest_message for word in ['more', 'other', 'different', 'else', 'another']):
                    return (True, 15)
        
        return (False, 8)  # Default
    
    def _extract_financial_profile(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Extract financial information from natural language query
        """
        financial_profile = {}
        message_lower = message.lower()
        
        # Extract monthly income FIRST (more specific, avoids conflicts)
        monthly_patterns = [
            r'\$?(\d+)k?\s*(?:per\s+)?(?:month|monthly)',
            r'monthly\s+income\s+(?:of\s+)?\$?(\d+)k?',
        ]
        for pattern in monthly_patterns:
            match = re.search(pattern, message_lower)
            if match:
                income_str = match.group(1)
                matched_text = match.group(0).lower()
                # Check if the matched text contains 'k' (e.g., "$5k per month")
                if 'k' in matched_text:
                    financial_profile['monthly_income'] = int(income_str) * 1000
                elif int(income_str) < 100:  # If less than 100, assume thousands
                    financial_profile['monthly_income'] = int(income_str) * 1000
                else:
                    financial_profile['monthly_income'] = int(income_str)  # Direct amount
                break
        
        # Extract annual income (only if monthly not already found)
        # Skip if message is about budget (not income)
        # Only extract if explicitly mentions income/make/earn OR if no budget context
        has_income_keywords = any(word in message_lower for word in ['make', 'earn', 'income', 'salary', 'wage'])
        has_budget_context = 'budget' in message_lower and not has_income_keywords
        
        if 'monthly_income' not in financial_profile and not has_budget_context:
            income_patterns = [
                r'\$?(\d+)k?\s*(?:per\s+)?(?:year|yearly|annual|annually)',
                r'annual\s+income\s+(?:of\s+)?\$?(\d+)k?',
                r'(?:make|earn)\s+\$?(\d+)k?\s*(?:per\s+)?year',
                r'(?:make|earn).*?\$?(\d+)k\b(?!.*month)(?!.*budget)',  # "make $60k" (not budget or monthly)
            ]
            for pattern in income_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    # Double-check: if "budget" appears near the match, skip it
                    match_start = message_lower.find(match.group(0))
                    nearby_text = message_lower[max(0, match_start-30):match_start+50]
                    if 'budget' not in nearby_text:
                        income_str = match.group(1)
                        matched_text = match.group(0).lower()
                        # Check if 'k' appears in the matched text (e.g., "$60k")
                        if 'k' in matched_text:
                            financial_profile['annual_income'] = int(income_str) * 1000
                        elif int(income_str) < 1000:
                            # If number is less than 1000 and no 'k', assume it's in thousands
                            financial_profile['annual_income'] = int(income_str) * 1000
                        else:
                            financial_profile['annual_income'] = int(income_str)
                        break
        
        # Detect ambiguous income: number provided but unclear if monthly or yearly
        # This catches cases like "I make $5000" or "income is $60k" without time period
        if 'monthly_income' not in financial_profile and 'annual_income' not in financial_profile:
            # Look for income-related numbers that don't have clear monthly/yearly context
            ambiguous_income_patterns = [
                r'(?:make|earn|income|salary|wage).*?\$?(\d+)k?\b(?!.*(?:month|monthly|year|yearly|annual|annually|budget|down))',
                r'\$?(\d+)k?\s*(?:income|salary|wage)(?!.*(?:month|monthly|year|yearly|annual|annually|budget|down))',
            ]
            
            for pattern in ambiguous_income_patterns:
                match = re.search(pattern, message_lower)
                if match:
                    # Double-check it's not about budget or down payment
                    match_start = message_lower.find(match.group(0))
                    nearby_text = message_lower[max(0, match_start-30):match_start+50]
                    if 'budget' not in nearby_text and 'down' not in nearby_text:
                        income_str = match.group(1)
                        income_num = int(income_str)
                        
                        # Determine if number could be monthly or yearly based on magnitude
                        # If it's a "k" number (e.g., $60k), it's likely annual
                        # If it's a number like $5000 without k, it could be either monthly or yearly
                        has_k = 'k' in match.group(0).lower()
                        
                        if has_k:
                            # "$60k" is typically annual, but we should still ask to confirm
                            financial_profile['ambiguous_income'] = income_num * 1000
                            financial_profile['ambiguous_income_likely_annual'] = True
                        elif 1000 <= income_num <= 20000:
                            # Numbers in this range could be monthly ($3k-$20k/month) or yearly ($3k-$20k/year)
                            # We need to ask for clarification
                            financial_profile['ambiguous_income'] = income_num
                            financial_profile['ambiguous_income_likely_annual'] = False  # Unclear
                        elif income_num > 20000:
                            # Numbers > $20k are likely annual (unless it's like "$50k per month" which would be explicit)
                            financial_profile['ambiguous_income'] = income_num
                            financial_profile['ambiguous_income_likely_annual'] = True
                        else:
                            # Very small numbers (< $1000) are likely monthly
                            financial_profile['ambiguous_income'] = income_num
                            financial_profile['ambiguous_income_likely_annual'] = False
                        break
        
        # Extract down payment
        down_payment_patterns = [
            r'down\s+payment\s+(?:of\s+)?\$?(\d+)k?',
            r'\$?(\d+)k?\s+down',
            r'can\s+put\s+down\s+\$?(\d+)k?',
            r'have\s+\$?(\d+)k?\s+(?:for\s+)?down',
        ]
        for pattern in down_payment_patterns:
            match = re.search(pattern, message_lower)
            if match:
                down = match.group(1)
                if 'k' in message_lower or int(down) < 1000:
                    financial_profile['down_payment'] = int(down) * 1000
                else:
                    financial_profile['down_payment'] = int(down)
                break
        
        # Extract credit score (numeric takes precedence over text ratings)
        credit_patterns = [
            r'credit\s+score\s+(?:of\s+|is\s+)?(\d{3})',  # "credit score 720" or "credit score is 720"
            r'(\d{3})\s+credit\s+score',  # "720 credit score"
            r'credit\s+(?:is|of)\s+(\d{3})',  # "credit is 720" or "credit of 720"
            r'(\d{3})\s+credit',  # "720 credit"
        ]
        for pattern in credit_patterns:
            match = re.search(pattern, message_lower)
            if match:
                financial_profile['credit_score'] = int(match.group(1))
                break
        
        # Detect credit rating terms (only if no numeric score found)
        if 'credit_score' not in financial_profile:
            if 'excellent credit' in message_lower or 'great credit' in message_lower:
                financial_profile['credit_score'] = 'excellent'
            elif 'good credit' in message_lower:
                financial_profile['credit_score'] = 'good'
            elif 'fair credit' in message_lower or 'average credit' in message_lower:
                financial_profile['credit_score'] = 'fair'
            elif 'poor credit' in message_lower or 'bad credit' in message_lower:
                financial_profile['credit_score'] = 'poor'
        
        # Extract loan term
        loan_term_patterns = [
            r'(\d+)\s*(?:year|yr)\s+loan',
            r'finance\s+(?:for\s+)?(\d+)\s+years',
        ]
        for pattern in loan_term_patterns:
            match = re.search(pattern, message_lower)
            if match:
                years = int(match.group(1))
                financial_profile['loan_term_months'] = years * 12
                break
        
        # Extract trade-in value
        trade_in_patterns = [
            r'trade[\s-]in\s+(?:worth\s+|value\s+)?\$?(\d+)k?',
            r'\$?(\d+)k?\s+trade[\s-]in',
        ]
        for pattern in trade_in_patterns:
            match = re.search(pattern, message_lower)
            if match:
                trade_in = match.group(1)
                if 'k' in message_lower or int(trade_in) < 1000:
                    financial_profile['trade_in_value'] = int(trade_in) * 1000
                else:
                    financial_profile['trade_in_value'] = int(trade_in)
                break
        
        return financial_profile if financial_profile else None
    
    def _priorities_to_weights(self, priorities: List[str], top_priority: Optional[str] = None) -> Dict[str, float]:
        """
        Convert user priorities to scoring weight adjustments
        
        Strategy:
        - Boost mentioned priorities
        - Top priority gets even higher weight
        - Reduce unmentioned categories
        - Maintain total weight sum ≈ 1.0
        
        Examples:
        - ["fuel_efficiency"] → fuel_efficiency gets 0.40, others reduced
        - ["fuel_efficiency", "safety"] → both get 0.30 each, others reduced
        - top_priority="space" → space gets 0.45, others get less
        """
        # Map priority names to scoring categories
        priority_map = {
            'fuel_efficiency': 'fuel_efficiency',
            'safety': 'safety',
            'space': 'seating',  # Space maps to seating category (includes cargo)
            'performance': 'performance',
            'budget': 'budget',
        }
        
        # Base weights (reduced for non-priorities)
        base_weight = 0.06
        priority_weight = 0.30
        top_priority_weight = 0.45  # Top priority gets much higher weight
        
        weights = {}
        num_priorities = len(priorities)
        
        if num_priorities == 0:
            return {}
        
        # If there's a top priority, give it extra weight
        if top_priority and top_priority in priorities:
            # Top priority gets the highest weight
            top_category = priority_map.get(top_priority)
            if top_category:
                weights[top_category] = top_priority_weight
            
            # Other priorities share remaining weight
            other_priorities = [p for p in priorities if p != top_priority]
            if other_priorities:
                remaining_weight = priority_weight
                weight_per_other = remaining_weight / len(other_priorities)
                for priority in other_priorities:
                    category = priority_map.get(priority)
                    if category:
                        weights[category] = weight_per_other
        else:
            # No top priority - distribute weight evenly
            weight_per_priority = priority_weight if num_priorities == 1 else priority_weight / num_priorities
            
            # Assign high weights to priorities
            for priority in priorities:
                category = priority_map.get(priority)
                if category:
                    weights[category] = weight_per_priority
        
        # Fill in remaining categories with base weight
        all_categories = ['budget', 'fuel_efficiency', 'seating', 'drivetrain', 
                         'vehicle_type', 'performance', 'features', 'safety']
        
        for category in all_categories:
            if category not in weights:
                weights[category] = base_weight
        
        # Normalize to sum to 1.0
        total = sum(weights.values())
        weights = {k: round(v / total, 2) for k, v in weights.items()}
        
        return weights
    
    def _get_car_details(self, car_id: str) -> Optional[Dict[str, Any]]:
        """Get full details for a specific car from catalog"""
        all_cars = self.catalog.get_all_cars()
        for car in all_cars:
            if car['id'] == car_id:
                return car
        return None
    
    def _format_car_for_context(
        self, 
        car: Dict[str, Any], 
        score: float, 
        reasons: List[str],
        financial_profile: Optional[Dict[str, Any]] = None
    ) -> str:
        """Format car info for Nemotron to explain, including financial analysis if available"""
        specs = car.get('specs', {})
        pricing = specs.get('pricing', {})
        powertrain = specs.get('powertrain', {})
        capacity = specs.get('capacity', {})
        safety = specs.get('safety', {})
        environment_fit = specs.get('environment_fit', {})
        
        # Get cargo space
        cargo_volume_l = capacity.get('cargo_volume_l', 0)
        cargo_volume_cuft = cargo_volume_l * 0.0353 if cargo_volume_l else 0
        cargo_space_str = car.get('cargo_space', '')
        if not cargo_space_str and cargo_volume_cuft > 0:
            cargo_space_str = f"{cargo_volume_cuft:.1f} cu ft"
        
        # Get ground clearance
        ground_clearance = environment_fit.get('ground_clearance_in', 0)
        
        ground_clearance_str = f"{ground_clearance:.1f}\"" if ground_clearance else "N/A"
        
        car_info = f"""
Car: {car.get('year')} {car.get('make')} {car.get('model')} {car.get('trim')}
Match Score: {score}
Price: ${pricing.get('base_msrp', 'N/A'):,}
MPG: {powertrain.get('mpg_city', 'N/A')} city / {powertrain.get('mpg_hwy', 'N/A')} hwy
Fuel Type: {powertrain.get('fuel_type', 'N/A')}
Drivetrain: {powertrain.get('drivetrain', 'N/A')}
Seats: {capacity.get('seats', 'N/A')}
Cargo Space: {cargo_space_str if cargo_space_str else 'N/A'}
Ground Clearance: {ground_clearance_str}
Body Style: {specs.get('body_style', 'N/A')}
Safety Rating: {safety.get('crash_test_score', 'N/A')}
Match Reasons: {', '.join(reasons)}
"""
        
        # Add financial analysis if user provided financial info
        if financial_profile:
            affordability = financial_service.evaluate_affordability(car, financial_profile)
            car_info += f"""
Financial Analysis:
  Monthly Payment: ${affordability.monthly_payment:,.2f}
  Down Payment Required: ${affordability.down_payment_required:,.2f}
  Total 5-Year Cost: ${affordability.total_cost_5yr:,.2f}
  Debt-to-Income Ratio: {affordability.debt_to_income_ratio:.1%}
  Affordability Score: {affordability.affordability_score:.0%}
  Status: {'✅ Financially Comfortable' if affordability.affordable else '⚠️ May Strain Budget'}
"""
            if affordability.warnings:
                car_info += f"  Warnings: {', '.join(affordability.warnings)}\n"
        
        return car_info
    
    async def process_message(self, messages: List[ChatMessage]) -> tuple[str, List[Dict[str, Any]], Optional[str]]:
        """
        Process incoming messages with Nemotron + Catalog integration
        
        Flow:
        1. Extract user profile from latest message
        2. If profile detected, get scored recommendations from catalog
        3. Give Nemotron the scored data to explain
        4. Nemotron provides personalized, grounded response
        
        Args:
            messages: Full chat history
        
        Returns:
            Tuple of (response_text, recommended_car_ids, scoring_method)
            - response_text: Agent's response as a string
            - recommended_car_ids: List of car ID strings (e.g., ["camry-le-2018", "rav4-xle-2020"])
            - scoring_method: "preference_based", "affordability_based", or None
        """
        if not self.client:
            return ("API key not configured. Please set NEMOTRON_API_KEY in .env", [], None)
        
        try:
            # Get the latest user message
            user_message = messages[-1].content if messages else ""
            
            # Check if user wants more results
            wants_more, num_results = self._should_show_more_results(messages)
            
            # Extract user profile and financial information from ALL messages (most recent takes precedence)
            user_profile, financial_profile = self._extract_profiles_from_conversation(messages)
            
            catalog_context = ""
            
            # Initialize recommended_car_ids list to return (just IDs, not full car data)
            recommended_car_ids_list = []
            
            # Determine what to show based on available information
            has_vehicle_preferences = user_profile and (
                user_profile.get("budget_max") or 
                user_profile.get("passengers") or 
                user_profile.get("priorities") or
                user_profile.get("features_wanted")
            )
            
            # Check if user has SUBSTANTIAL vehicle preferences (enough to show results)
            has_substantial_preferences = self._has_substantial_vehicle_preferences(user_profile)
            
            has_financial_info = financial_profile and (
                financial_profile.get("annual_income") or 
                financial_profile.get("monthly_income")
            )
            
            # PRIORITY: If user has substantial preferences, show results FIRST
            # Even without financial info, we can provide meaningful recommendations
            if has_substantial_preferences:
                # User provided substantial vehicle preferences - score by preferences
                # Use estimated base price if budget is total cost
                scoring_profile = user_profile.copy() if user_profile else {}
                if scoring_profile.get("budget_is_total_cost") and scoring_profile.get("budget_max_estimated_base"):
                    # Use estimated base price for scoring, but keep original for context
                    scoring_profile["budget_max"] = scoring_profile["budget_max_estimated_base"]
                
                scored_cars = self.catalog.score_cars_for_user(scoring_profile)
                # Adjust number of results based on user request
                cars_to_fetch = num_results if wants_more else 8
                top_cars = scored_cars[:cars_to_fetch]
                scoring_method = "preference_based"
            elif has_vehicle_preferences:
                # User has some preferences but not substantial - still show results
                scored_cars = self.catalog.score_cars_for_user(user_profile)
                cars_to_fetch = num_results if wants_more else 8
                top_cars = scored_cars[:cars_to_fetch]
                scoring_method = "preference_based"
            elif has_financial_info:
                # User only provided financial info - show affordable cars
                # Create a minimal profile to get all cars, then filter by affordability
                scored_cars = self.catalog.score_cars_for_user({})  # Get all cars scored neutrally
                # Get enough cars based on requested results (multiply by 2 to ensure we have enough after filtering)
                cars_to_fetch = max(20, num_results * 2) if wants_more else 20
                top_cars = scored_cars[:cars_to_fetch]
                scoring_method = "affordability_based"
            else:
                # No specific info - don't show recommendations yet
                top_cars = []
                scoring_method = None
            
            # Analyze missing information for ambiguous queries
            missing_info = self._analyze_missing_information(user_profile, financial_profile, user_message)
            
            # Check if we have ambiguous income that needs clarification
            has_ambiguous_income = financial_profile and financial_profile.get("ambiguous_income")
            
            # Query is ambiguous if:
            # 1. No substantial vehicle preferences AND no clear financial info (no monthly/annual income)
            # 2. OR we have ambiguous income that needs clarification AND no substantial preferences
            # BUT: If we have substantial preferences, we're NOT ambiguous - we can show results!
            is_ambiguous_query = (
                (not has_substantial_preferences and not has_financial_info) or
                (has_ambiguous_income and not has_financial_info and not has_substantial_preferences)
            )
            
            if top_cars:
                # Filter and sort by affordability if financial info available
                if has_financial_info and scoring_method == "affordability_based":
                    # Score each car by affordability
                    car_affordability = []
                    for scored_car in top_cars:
                        car_details = self._get_car_details(scored_car['id'])
                        if car_details:
                            affordability = financial_service.evaluate_affordability(
                                car_details, financial_profile
                            )
                            # Only include cars that are affordable (or borderline acceptable)
                            # Filter out cars with DTI > 18% (clearly unaffordable)
                            if affordability.debt_to_income_ratio <= 0.18:
                                # Combine affordability score with preference score (if any)
                                combined_score = (
                                    affordability.affordability_score * 0.7 +  # Affordability is 70%
                                    scored_car['score'] * 0.3  # Base preference is 30%
                                )
                                car_affordability.append({
                                    'car': scored_car,
                                    'details': car_details,
                                    'affordability': affordability,
                                    'combined_score': combined_score
                                })
                    
                    # Sort by combined score (affordability + preference)
                    car_affordability.sort(key=lambda x: x['combined_score'], reverse=True)
                    # Take enough cars based on requested results (add buffer for filtering)
                    max_cars = max(num_results + 5, 12) if wants_more else 12
                    top_cars_filtered = car_affordability[:max_cars] if len(car_affordability) >= max_cars else car_affordability
                    
                    # Collect recommended car IDs for API response
                    for car_data in top_cars_filtered[:num_results]:
                        car_details = car_data.get('details')
                        if car_details and car_details.get('id'):
                            recommended_car_ids_list.append(car_details['id'])
                elif has_financial_info:
                    # User has both preferences and financial info
                    car_affordability = []
                    for scored_car in top_cars[:10]:
                        car_details = self._get_car_details(scored_car['id'])
                        if car_details:
                            affordability = financial_service.evaluate_affordability(
                                car_details, financial_profile
                            )
                            # Prioritize preference matches that are also affordable
                            combined_score = (
                                scored_car['score'] * 0.6 +  # Preference is 60%
                                affordability.affordability_score * 0.4  # Affordability is 40%
                            )
                            car_affordability.append({
                                'car': scored_car,
                                'details': car_details,
                                'affordability': affordability,
                                'combined_score': combined_score
                            })
                    car_affordability.sort(key=lambda x: x['combined_score'], reverse=True)
                    top_cars_filtered = car_affordability[:10]
                    
                    # Collect recommended car IDs for API response
                    for car_data in top_cars_filtered:
                        car_details = car_data.get('details')
                        if car_details and car_details.get('id'):
                            recommended_car_ids_list.append(car_details['id'])
                else:
                    # Only preferences, no financial info
                    top_cars_filtered = [
                        {
                            'car': scored_car,
                            'details': self._get_car_details(scored_car['id']),
                            'affordability': None,
                            'combined_score': scored_car['score']
                        }
                        for scored_car in top_cars[:10]
                        if self._get_car_details(scored_car['id'])
                    ]
                
                # Collect recommended car IDs for API response
                for car_data in top_cars_filtered[:num_results]:
                    car_details = car_data.get('details')
                    if car_details and car_details.get('id'):
                        recommended_car_ids_list.append(car_details['id'])
                
                # Build context with car details
                catalog_context = "\n\n--- CATALOG SEARCH RESULTS ---\n"
                
                # Acknowledge user requirements clearly
                if user_profile:
                    catalog_context += "USER REQUIREMENTS SUMMARY:\n"
                    if user_profile.get("top_priority"):
                        catalog_context += f"🎯 TOP PRIORITY: {user_profile['top_priority'].replace('_', ' ').title()}\n"
                    if user_profile.get("budget_max"):
                        budget_type = "total cost (including taxes/fees)" if user_profile.get("budget_is_total_cost") else "base price"
                        if user_profile.get("budget_flexible"):
                            catalog_context += f"💰 Budget: ~${user_profile['budget_max']:,} ({budget_type}) - FLEXIBLE\n"
                        else:
                            catalog_context += f"💰 Budget: ${user_profile['budget_max']:,} ({budget_type})\n"
                    if user_profile.get("passengers"):
                        catalog_context += f"👥 Passengers: {user_profile['passengers']}\n"
                    if user_profile.get("has_children"):
                        catalog_context += f"👶 Has children/baby (needs baby seat room)\n"
                    if user_profile.get("priorities"):
                        catalog_context += f"⭐ Priorities: {', '.join([p.replace('_', ' ').title() for p in user_profile['priorities']])}\n"
                    if user_profile.get("terrain"):
                        terrain_desc = user_profile['terrain'].replace('_', ' ').title()
                        catalog_context += f"🛣️ Terrain: {terrain_desc}\n"
                    if user_profile.get("needs_ground_clearance"):
                        catalog_context += f"🚗 Needs: Good ground clearance for potholes/speed bumps\n"
                    if user_profile.get("features_wanted"):
                        catalog_context += f"🔧 Features: {', '.join([f.replace('_', ' ').title() for f in user_profile['features_wanted']])}\n"
                    catalog_context += "\n"
                
                if financial_profile:
                    catalog_context += f"Financial Profile: {json.dumps(financial_profile, indent=2)}\n"
                
                if scoring_method == "affordability_based":
                    catalog_context += f"\nShowing top affordable Toyota vehicles based on financial profile:\n"
                else:
                    catalog_context += f"\nTop {len(top_cars_filtered)} Matches (ranked by how well they match your requirements):\n"
                
                for i, car_data in enumerate(top_cars_filtered[:num_results], 1):  # Dynamic number of results
                    car_details = car_data['details']
                    scored_car = car_data['car']
                    affordability = car_data.get('affordability')
                    
                    if car_details:
                        catalog_context += f"\n{i}. {self._format_car_for_context(car_details, scored_car['score'], scored_car['reasons'], financial_profile if financial_profile else None)}"
                
                catalog_context += "\n--- END CATALOG RESULTS ---\n"
                
                # If we have affordability-based results with no vehicle preferences, format response directly
                if scoring_method == "affordability_based" and not has_vehicle_preferences and top_cars_filtered:
                    # Build the response directly with car listings
                    response_parts = []
                    if wants_more:
                        response_parts.append(f"Here are {min(num_results, len(top_cars_filtered))} more affordable Toyota options:\n\n")
                    else:
                        response_parts.append("Based on your financial profile, here are affordable Toyota options that fit your budget:\n\n")
                    
                    for i, car_data in enumerate(top_cars_filtered[:num_results], 1):
                        car_details = car_data['details']
                        affordability = car_data.get('affordability')
                        if car_details and affordability:
                            pricing = car_details.get('specs', {}).get('pricing', {})
                            powertrain = car_details.get('specs', {}).get('powertrain', {})
                            capacity = car_details.get('specs', {}).get('capacity', {})
                            
                            response_parts.append(f"**{i}. {car_details.get('year')} {car_details.get('make')} {car_details.get('model')} {car_details.get('trim')}**\n")
                            response_parts.append(f"   • Price: ${pricing.get('base_msrp', 0):,}\n")
                            response_parts.append(f"   • Monthly Payment: ${affordability.monthly_payment:,.2f} ({affordability.debt_to_income_ratio:.1%} of income)\n")
                            response_parts.append(f"   • Seats: {capacity.get('seats', 'N/A')}\n")
                            response_parts.append(f"   • MPG: {powertrain.get('mpg_city', 'N/A')} city / {powertrain.get('mpg_hwy', 'N/A')} hwy\n")
                            
                            if affordability.affordability_score >= 0.9:
                                response_parts.append(f"   • Affordability: ✅ Excellent ({affordability.affordability_score:.0%})\n")
                            elif affordability.affordability_score >= 0.7:
                                response_parts.append(f"   • Affordability: ✅ Good ({affordability.affordability_score:.0%})\n")
                            else:
                                response_parts.append(f"   • Affordability: ⚠️ Acceptable ({affordability.affordability_score:.0%})\n")
                            
                            if affordability.warnings:
                                response_parts.append(f"   • Note: {affordability.warnings[0]}\n")
                            
                            response_parts.append("\n")
                    
                    if not wants_more:
                        # Only show refinement suggestions if this is the first set of results
                        response_parts.append("\nTo help narrow down further, you can tell me:\n")
                        response_parts.append("• What type of vehicle you need (sedan, SUV, truck, etc.)\n")
                        response_parts.append("• How many passengers you need to seat\n")
                        response_parts.append("• Any priorities (fuel efficiency, space, performance, safety)\n")
                        response_parts.append("• Specific features wanted (AWD, hybrid, 3rd row, etc.)\n")
                        response_parts.append("\nOr say 'show more' to see additional options.\n")
                    else:
                        response_parts.append("\nWould you like to refine your search by mentioning specific needs, or see even more options?\n")
                    
                    return ("".join(response_parts), recommended_car_ids_list, scoring_method)
                
                # Provide instructions for Nemotron for other cases
                if wants_more:
                    catalog_context += f"\nThe user is asking for more results. Show {num_results} cars from the list above. "
                    catalog_context += "You can mention that these are additional options based on their previous criteria."
                
                if has_financial_info:
                    catalog_context += "\nPlease explain these recommendations in a friendly, conversational way. Focus on:"
                    catalog_context += "\n- Acknowledge the user's requirements (especially top priority if specified)"
                    catalog_context += "\n- Why each car matches their specific needs"
                    catalog_context += "\n- The financial implications (monthly payment, affordability, total cost)"
                    catalog_context += "\n- Any warnings about budget or payments"
                    catalog_context += "\n- Practical financial advice"
                else:
                    # No financial info but we have substantial preferences - show results first, then ask for financial info
                    catalog_context += "\nIMPORTANT RESPONSE STRUCTURE:\n"
                    catalog_context += "1. FIRST: Acknowledge all the user's requirements clearly\n"
                    catalog_context += "2. SECOND: Show the top car recommendations with explanations of why they match\n"
                    catalog_context += "3. THIRD: Mention that to calculate exact monthly payments and finalize affordability, you need financial information\n"
                    catalog_context += "4. FOURTH: Ask for financial info (income, credit score, down payment) to refine recommendations\n\n"
                    catalog_context += "RESPONSE TONE:\n"
                    catalog_context += "- Be enthusiastic about the matches you found\n"
                    catalog_context += "- Emphasize how the cars address their top priority and specific needs\n"
                    catalog_context += "- Frame financial questions as 'to calculate exact payments' not 'I need more info before I can help'\n"
                    catalog_context += "- Make it clear the recommendations are based on their preferences, financial info will help refine\n"
                    
                    # Add context about what financial info would help
                    financial_info_needed = []
                    if missing_info["needs_income"] and not missing_info["needs_income_clarification"]:
                        financial_info_needed.append("income (to calculate monthly payments)")
                    if missing_info["needs_credit"]:
                        financial_info_needed.append("credit score (to determine interest rates)")
                    if missing_info["needs_down_payment"]:
                        financial_info_needed.append("down payment amount (to calculate loan amount)")
                    
                    if financial_info_needed:
                        catalog_context += f"\nTo calculate exact monthly payments: Ask for {', '.join(financial_info_needed)}\n"
                    
                    # Handle ambiguous income
                    if missing_info["needs_income_clarification"]:
                        ambiguous_amount = missing_info["ambiguous_income_amount"]
                        if ambiguous_amount >= 1000:
                            amount_str = f"${ambiguous_amount:,}"
                        else:
                            amount_str = f"${ambiguous_amount}"
                        catalog_context += f"\nIMPORTANT: User mentioned income of {amount_str} but unclear if monthly/yearly. Ask for clarification.\n"
                    
                    if wants_more:
                        catalog_context += "\n- The user asked for more results, so show the additional options from above."
            
            # Handle ambiguous queries - provide context to Nemotron about missing information
            if is_ambiguous_query and not catalog_context:
                # Build clarification context for Nemotron
                clarification_context = "The user's query is ambiguous or missing critical information. "
                clarification_context += "To provide accurate recommendations using the catalog scoring and financial analysis tools, you need more details.\n\n"
                
                clarification_context += "MISSING INFORMATION ANALYSIS:\n"
                
                # First, acknowledge what information HAS been provided (so Nemotron knows what not to ask about)
                if user_profile:
                    provided_info = []
                    if user_profile.get("budget_max"):
                        provided_info.append("budget")
                    if user_profile.get("passengers"):
                        provided_info.append("passenger count")
                    if user_profile.get("terrain") or user_profile.get("commute_miles"):
                        provided_info.append("terrain/commute")
                    if user_profile.get("features_wanted"):
                        provided_info.append("features")
                    if user_profile.get("priorities"):
                        provided_info.append("priorities")
                    
                    if provided_info:
                        clarification_context += f"✓ Already provided: {', '.join(provided_info)}\n\n"
                
                # Then list what's missing
                if missing_info["needs_budget"]:
                    clarification_context += "- Budget: Not specified. The scoring tool uses budget to filter and rank vehicles.\n"
                if missing_info["needs_passengers"]:
                    clarification_context += "- Passenger count: Not specified. Needed to match vehicles with appropriate seating capacity.\n"
                if missing_info["needs_commute"]:
                    clarification_context += "- Terrain/commute: Not specified. Needed to recommend vehicles suited for your driving conditions (city, highway, off-road).\n"
                
                # Handle ambiguous income (takes priority - more specific than general income)
                if missing_info["needs_income_clarification"]:
                    ambiguous_amount = missing_info["ambiguous_income_amount"]
                    likely_annual = missing_info["ambiguous_income_likely_annual"]
                    if ambiguous_amount >= 1000:
                        amount_str = f"${ambiguous_amount:,}"
                    else:
                        amount_str = f"${ambiguous_amount}"
                    
                    clarification_context += f"- Income: User provided {amount_str}, but it's unclear if this is monthly or yearly income. "
                    clarification_context += "This is CRITICAL for accurate financial calculations:\n"
                    clarification_context += "  * Monthly payments depend on whether income is monthly or yearly\n"
                    clarification_context += "  * Debt-to-income (DTI) ratio calculations require monthly income\n"
                    clarification_context += "  * Affordability analysis needs accurate monthly income to be meaningful\n"
                    if likely_annual is not None:
                        clarification_context += f"  * Based on the amount, it's likely {'annual' if likely_annual else 'monthly'}, but you should confirm\n"
                elif missing_info["needs_income"]:
                    clarification_context += "- Income: Not specified. Required for financial affordability analysis (monthly payments, DTI ratio).\n"
                
                if missing_info["needs_credit"]:
                    clarification_context += "- Credit score: Not specified. Critical for calculating interest rates (affects monthly payment significantly).\n"
                if missing_info["needs_down_payment"]:
                    clarification_context += "- Down payment: Not specified. Affects loan amount and monthly payments.\n"
                if missing_info["needs_priorities"]:
                    clarification_context += "- Priorities: Not specified. Needed to adjust scoring weights (fuel efficiency, performance, safety, space, etc.).\n"
                if missing_info["needs_features"]:
                    clarification_context += "- Features: Not specified. Users may want AWD, hybrid, 3rd row seating, etc.\n"
                
                clarification_context += "\nYOUR TASK:\n"
                clarification_context += "1. Acknowledge what information the user has already provided (if any)\n"
                clarification_context += "2. Ask friendly, conversational clarifying questions ONLY about the missing information listed above\n"
                clarification_context += "3. Do NOT ask about information that has already been provided\n"
                clarification_context += "4. Focus on what's needed to use the catalog scoring and financial analysis tools effectively\n"
                clarification_context += "5. Be helpful and explain why you need this information (e.g., 'To calculate your monthly payment, I need to know...')\n\n"
                
                if missing_info["suggested_questions"]:
                    clarification_context += "SUGGESTED QUESTIONS (you can adapt these naturally):\n"
                    for i, question in enumerate(missing_info["suggested_questions"], 1):
                        clarification_context += f"{i}. {question}\n"
                    clarification_context += "\n"
                
                clarification_context += "IMPORTANT: Once you have the necessary information, use it to provide specific, data-driven recommendations based on the Toyota catalog."
                
                catalog_context = clarification_context
            
            # Convert messages to Nemotron API format for other cases
            formatted_messages = self._convert_messages_to_nemotron_format(messages)
            # Add catalog context if available
            if catalog_context:
                formatted_messages.append({
                    "role": "system",
                    "content": catalog_context
                })
            
            # Call Nemotron API with streaming and reasoning
            completion = self.client.chat.completions.create(
                model="nvidia/nvidia-nemotron-nano-9b-v2",
                messages=formatted_messages,
                temperature=settings.MODEL_TEMPERATURE,
                top_p=0.95,
                max_tokens=settings.MAX_TOKENS,
                frequency_penalty=0,
                presence_penalty=0,
                stream=True,
                extra_body={
                    "min_thinking_tokens": 512,
                    "max_thinking_tokens": 1024
                }
            )
            
            # Collect the response (streaming)
            response_content = ""
            for chunk in completion:
                # Handle reasoning content (thinking tokens)
                reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
                if reasoning:
                    pass  # Reasoning tokens handled but not returned
                
                # Collect actual response content
                if chunk.choices[0].delta.content is not None:
                    response_content += chunk.choices[0].delta.content
            
            response_text = response_content.strip() if response_content.strip() else "I'm here to help you find the perfect Toyota!"
            return (response_text, recommended_car_ids_list, scoring_method)
            
        except Exception as e:
            print(f"Error calling Nemotron API: {e}")
            return (f"I encountered an error while processing your request. Please try again.", [], None)

# Singleton instance
ai_agent = AIAgent()
