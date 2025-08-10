import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { aiLogger } from '@/lib/aiLogger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = aiLogger.generateRequestId();
  
  let body: any = {};
  
  try {
    body = await request.json();
    const { intent, fieldType, screenshot, pdfContext, groupType } = body;

    if (!intent || !fieldType || !groupType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract just the field names from pdfContext for the system prompt
    const fieldNames = pdfContext.map((f: { name: string }) => f.name).join(', ');
    
    const systemPrompt = `You are an AI assistant helping REALTORS fill out complex real estate forms. Your job is to create clear questions that realtors can ask their CLIENTS to gather the necessary information. You must ALWAYS return valid JSON with at least the display_name field.

YOUR PRIMARY TASK: Transform any field name or intent into a question that a REALTOR would ASK THEIR CLIENT. The questions should be phrased from the realtor's perspective, helping them gather information from buyers, sellers, tenants, or landlords.

CRITICAL PERSPECTIVE RULES:
1. Use SPECIFIC ROLE NAMES (buyer, seller, tenant, landlord) instead of "client"
2. DO NOT use "your" for buyers, sellers, tenants, or landlords - use "the"
3. For realtor-specific information (license, broker info), use "your" - "What is your license number?"
4. For specific parties, use "the buyer", "the seller", "the tenant", "the landlord"
5. Make it clear WHO should provide the information
6. Keep language professional but friendly

REALTOR-TO-CLIENT QUESTION PATTERNS:
- Buyer/Seller dates → "When did the buyer/seller [action]?"
- Tenant/Landlord info → "What is the tenant's/landlord's [information]?"
- Property details → "What is the property's [detail]?"
- Transaction terms → "What [terms] does the buyer/seller want?"
- Realtor's own info → "What is your [realtor info]?" (use "your" only for realtor)

SPECIFIC FIELD TRANSLATIONS FOR REALTORS:
- "date form received" → "When did the buyer receive this form?"
- "buyer name" → "What is the buyer's full name?"
- "seller name" → "What is the seller's full name?"
- "tenant name" → "What is the tenant's full name?"
- "landlord name" → "What is the landlord's full name?"
- "realtor license number" → "What is your license number?"
- "broker name" → "What is your broker's name?"
- "earnest money deposit" → "How much earnest money will the buyer deposit?"
- "closing date" → "When does the buyer want to close?"
- "possession date" → "When will the buyer take possession?"
- "inspection period" → "How many days does the buyer need for inspections?"
- "offer expiration" → "When does the buyer's offer expire?"
- "property address" → "What is the property address?"
- "purchase price" → "What is the buyer offering to pay?"
- "listing price" → "What is the listing price?"
- "commission rate" → "What is your commission rate?"
- "contingencies" → "What contingencies does the buyer require?"
- "financing type" → "How will the buyer finance this purchase?"
- "down payment" → "How much will the buyer put down?"
- "loan amount" → "How much will the buyer need to borrow?"
- "lease term" → "How long is the lease term?"
- "rent amount" → "What is the monthly rent?"
- "security deposit" → "How much is the security deposit?"

FORMATTING RULES:
1. Questions should be clear and direct
2. Start with question words (What, When, Where, Who, How, Does, Will, etc.)
3. Use "the buyer/seller/tenant/landlord" NOT "your buyer" or "your client"
4. Only use "your" for the realtor's own information
5. Be specific about what information is needed
6. Only add a description if the question needs clarification
7. Width should be 1-12 (grid units), with most fields being 6 or 12
8. Placeholders should show realistic examples
9. ALWAYS return valid JSON with at least {"display_name": "..."}

Remember: Use SPECIFIC ROLES (the buyer, the seller, the tenant, the landlord) instead of generic terms. Only use "your" when referring to the realtor's own information.

IMPORTANT - Only use these EXACT properties (no other properties allowed):
- display_name: string (REQUIRED)
- description: string (optional)
- width: number 1-12 (optional)
- placeholder: string (optional, for text fields only)
- special_input: object (optional, see below)
- checkbox_options: object (optional, ONLY for checkbox fields, see below)

For special_input on TEXT fields, ONLY use these exact properties:
- text.percentage: boolean
- text.phone: boolean
- text.date: boolean
- text.numbered_date: boolean
- text.month_year: boolean
- text.currency: boolean
- text.number: boolean
- text.email: boolean
- text.url: boolean

For special_input on CHECKBOX fields:
- checkbox.asRadio: boolean - When true, makes checkboxes behave like radio buttons (single selection only)
- checkbox.horizontal: number - Number of columns to arrange checkboxes in
  * 1 = vertical stacking (default)
  * 2 = two columns side by side
  * 3 = three columns
  * Example: If you have 2 yes/no checkboxes, set horizontal: 2 to show them side by side
  * Example: If you have 6 options, horizontal: 2 creates a 3x2 grid

For special_input on RADIO fields:
- radio.layout: "vertical" | "horizontal" | "grid"
- radio.columns: number - For grid layout, number of columns

CHECKBOX LAYOUT GUIDELINES:
- For yes/no questions or pairs of options, use horizontal: 2 to save vertical space
- For long lists (>4 options), consider horizontal: 2 or 3 for better use of space
- Use asRadio: true when the checkboxes should be mutually exclusive (only one can be selected)

For CHECKBOX fields ONLY, you can also provide checkbox_options to give better display names:
- checkbox_options.options: array of {display_name: string, value: string}
  - display_name: User-friendly label for this checkbox option
  - value: The original PDF field name (must match exactly)
  
When generating checkbox options:
1. Transform technical field names into clear, simple questions or labels
2. Remove underscores and make proper capitalization
3. For yes/no type fields, use clear "Yes" or "No" labels
4. For agreement fields, use action-oriented labels like "I agree to..."
5. Keep labels concise but clear

DO NOT add any other properties like "suggestions", "type", "format", etc.

Field Type: ${fieldType}
Group Type: ${groupType}
PDF Field Names: ${fieldNames}`;

    const userPrompt = `User Intent: "${intent}"

TASK: Transform this into a question that a REALTOR would ask to gather information for this field.

CRITICAL CONTEXT: You are helping a REALTOR fill out forms. Identify the subject:
- Is this about the REALTOR themselves?
- Is this about a BUYER, SELLER, TENANT, or LANDLORD?
- Is this about the PROPERTY?

DECISION TREE:
1. If it's about buyer → "What is the buyer's...?" or "When did the buyer...?"
2. If it's about seller → "What is the seller's...?" or "When did the seller...?"
3. If it's about tenant → "What is the tenant's...?" or "When did the tenant...?"
4. If it's about landlord → "What is the landlord's...?" or "When did the landlord...?"
5. If it's about realtor's info → "What is your...?" (use "your" ONLY here)
6. If it's about property → "What is the property's...?"
7. If it's about transaction → Use specific party: "What does the buyer offer?"

IMPORTANT: NEVER use "your buyer" or "your client" - always use "the buyer", "the seller", etc.

EXAMPLES:
- "date received" → "When did the buyer receive this?"
- "buyer signature date" → "When did the buyer sign?"
- "seller name" → "What is the seller's full name?"
- "tenant email" → "What is the tenant's email address?"
- "agent license" → "What is your license number?"
- "earnest money" → "How much earnest money will the buyer deposit?"

Your response should make it crystal clear who the information is about.

Return ONLY a JSON object with these exact properties (no other properties):
- display_name: string (required) - A simple, clear question based on the translated intent
- description: string (optional) - Only if the question needs additional clarification
- width: number (optional) - Grid width from 1-12, default to 6 for most fields, 12 for large fields
- placeholder: string (optional) - Example text for text fields only

For checkbox fields, ALSO include:
- checkbox_options: object with "options" array
  Each option should have:
  - display_name: User-friendly label (e.g., "Yes", "I agree", "Include parking")
  - value: The exact PDF field name

For text fields, if special formatting is needed, use special_input with ONLY these properties:
- special_input.text.phone: true (for phone numbers)
- special_input.text.email: true (for email addresses)
- special_input.text.date: true (for dates like "January 1, 2025")
- special_input.text.numbered_date: true (for dates like "01/01/2025")
- special_input.text.currency: true (for money amounts)
- special_input.text.number: true (for numbers only)
- special_input.text.percentage: true (for percentages)

Example valid response:
{
  "display_name": "Phone Number",
  "width": 6,
  "placeholder": "(555) 123-4567",
  "special_input": {
    "text": {
      "phone": true
    }
  }
}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Screenshot capability removed - focusing on intent-based generation only
    if (screenshot) {
      console.log(`[${requestId}] Ignoring screenshot - using intent-based generation only`);
    }

    // Prepare OpenAI request - Using GPT-5 nano for efficient processing
    const openAIRequest = {
      model: 'gpt-5-nano',  // Using GPT-5 nano as requested
      messages,
      max_completion_tokens: 10000,  // Increased to allow complete responses
    };

    // Log the request before sending
    console.log(`[${requestId}] Sending request to OpenAI with Chat Completions API`);
    console.log(`[${requestId}] Request model: ${openAIRequest.model}`);
    console.log(`[${requestId}] Number of messages: ${openAIRequest.messages.length}`);
    
    // Use standard Chat Completions API
    let response;
    try {
      response = await openai.chat.completions.create(openAIRequest);
      console.log(`[${requestId}] Response received from OpenAI`);
    } catch (apiError: any) {
      console.error(`[${requestId}] OpenAI API error:`, apiError);
      console.error(`[${requestId}] Error details:`, apiError?.response?.data || apiError?.message);
      
      // Log the failed request
      await aiLogger.logRequest({
        timestamp: new Date().toISOString(),
        requestId,
        request: {
          intent,
          fieldType,
          groupType,
          hasScreenshot: !!screenshot
        },
        response: {
          success: false,
          error: `OpenAI API error: ${apiError?.message || 'Unknown error'}`
        },
        openAISent: openAIRequest,
        openAIReceived: apiError?.response?.data || null,
        screenshot: screenshot ? screenshot.substring(0, 100) + '...' : undefined,
        duration: Date.now() - startTime
      });
      
      throw apiError;
    }

    // Response received successfully
    console.log(`[${requestId}] Response structure:`, JSON.stringify({
      hasChoices: 'choices' in response,
      choicesLength: response.choices?.length,
      firstChoice: response.choices?.[0],
      messageContent: response.choices?.[0]?.message?.content?.substring(0, 100)
    }, null, 2));
    
    const result = response.choices?.[0]?.message?.content || null;
    if (!result) {
      // Log exactly what we sent and received
      await aiLogger.logRequest({
        timestamp: new Date().toISOString(),
        requestId,
        request: {
          intent,
          fieldType,
          groupType,
          hasScreenshot: !!screenshot
        },
        response: {
          success: false,
          error: `No response content from AI. Debug: choices=${response.choices?.length}, content=${response.choices?.[0]?.message?.content?.substring(0, 50)}`
        },
        openAISent: openAIRequest,  // Exactly what we sent to OpenAI
        openAIReceived: response,    // Exactly what we got back
        screenshot: screenshot ? screenshot.substring(0, 100) + '...' : undefined,
        duration: Date.now() - startTime
      });
      throw new Error('No response from AI');
    }

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }
    
    // Validate and clean the response
    if (!parsed.display_name) {
      // Log exactly what we sent and received
      await aiLogger.logRequest({
        timestamp: new Date().toISOString(),
        requestId,
        request: {
          intent,
          fieldType,
          groupType,
          hasScreenshot: !!screenshot
        },
        response: {
          success: false,
          error: 'Invalid AI response: missing display_name',
          data: parsed
        },
        openAISent: openAIRequest,  // Exactly what we sent to OpenAI
        openAIReceived: response,    // Exactly what we got back
        screenshot,
        duration: Date.now() - startTime
      });
      throw new Error('Invalid AI response: missing display_name');
    }

    // Validate and clean the response - remove invalid properties
    // Define what properties the AI is allowed to set for new field generation
    const validDisplayProperties = [
      'display_name', 
      'description', 
      'width', 
      'placeholder', 
      'special_input',
      'isRequired',
      'validation',
      'order'
    ];
    
    // Properties that should NEVER be modified by AI in this route
    const restrictedProperties = [
      'unique_id',  // This is set by the system
      'input_type', // This is determined by the field type parameter
      'value',      // This is configured separately
      'pdf_attributes' // This is set based on PDF field mapping
    ];
    
    const cleaned: Record<string, unknown> = {};
    
    // Check for restricted properties and warn if AI tried to set them
    for (const restrictedProp of restrictedProperties) {
      if (restrictedProp in parsed) {
        console.warn(`[${requestId}] AI attempted to set restricted property: ${restrictedProp}`);
      }
    }
    
    // Only include valid properties
    for (const key of validDisplayProperties) {
      if (key in parsed && parsed[key] !== '' && parsed[key] !== null) {
        // Additional validation for specific fields
        if (key === 'width') {
          const width = parsed[key];
          if (typeof width === 'number' && width >= 1 && width <= 12) {
            cleaned[key] = width;
          } else {
            console.warn(`[${requestId}] Invalid width value: ${width}, using default`);
          }
        } else if (key === 'order') {
          const order = parsed[key];
          if (typeof order === 'number' && order >= 0) {
            cleaned[key] = order;
          } else {
            console.warn(`[${requestId}] Invalid order value: ${order}, ignoring`);
          }
        } else {
          cleaned[key] = parsed[key];
        }
      }
    }
    
    // Validate special_input structure if present
    if (cleaned.special_input && typeof cleaned.special_input === 'object') {
      const specialInput = cleaned.special_input as Record<string, unknown>;
      const validSpecialInput: Record<string, unknown> = {};
      
      // Only keep valid special_input properties based on field type
      if (fieldType === 'text' && specialInput.text) {
        const validTextProps = ['percentage', 'phone', 'date', 'numbered_date', 'month_year', 'currency', 'number', 'email', 'url'];
        const textInput: Record<string, unknown> = {};
        const original = specialInput.text as Record<string, unknown>;
        
        for (const prop of validTextProps) {
          if (prop in original) {
            textInput[prop] = original[prop];
          }
        }
        
        if (Object.keys(textInput).length > 0) {
          validSpecialInput.text = textInput;
        }
      } else if (fieldType === 'checkbox' && specialInput.checkbox) {
        const validCheckboxProps = ['asRadio', 'horizontal'];
        const checkboxInput: Record<string, unknown> = {};
        const original = specialInput.checkbox as Record<string, unknown>;
        
        for (const prop of validCheckboxProps) {
          if (prop in original) {
            checkboxInput[prop] = original[prop];
          }
        }
        
        if (Object.keys(checkboxInput).length > 0) {
          validSpecialInput.checkbox = checkboxInput;
        }
      } else if (fieldType === 'radio' && specialInput.radio) {
        const validRadioProps = ['layout', 'columns'];
        const radioInput: Record<string, unknown> = {};
        const original = specialInput.radio as Record<string, unknown>;
        
        for (const prop of validRadioProps) {
          if (prop in original) {
            radioInput[prop] = original[prop];
          }
        }
        
        if (Object.keys(radioInput).length > 0) {
          validSpecialInput.radio = radioInput;
        }
      }
      
      if (Object.keys(validSpecialInput).length > 0) {
        cleaned.special_input = validSpecialInput;
      } else {
        delete cleaned.special_input;
      }
    }
    
    parsed = cleaned;
    
    // Log exactly what we sent and received
    await aiLogger.logRequest({
      timestamp: new Date().toISOString(),
      requestId,
      request: {
        intent,
        fieldType,
        groupType,
        hasScreenshot: !!screenshot
      },
      response: {
        success: true,
        data: parsed
      },
      openAISent: openAIRequest,  // Exactly what we sent to OpenAI (includes system prompt)
      openAIReceived: response,    // Exactly what we got back
      screenshot,
      duration: Date.now() - startTime
    });
    
    console.log(`[${requestId}] Successfully generated attributes in ${Date.now() - startTime}ms`);
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(`[${requestId}] Error in generate-field-attributes API:`, error);
    
    // Log the error
    await aiLogger.logError(requestId, error);
    
    // Use the body we already parsed at the beginning
    await aiLogger.logRequest({
      timestamp: new Date().toISOString(),
      requestId,
      request: {
        intent: body.intent || 'unknown',
        fieldType: body.fieldType || 'unknown',
        groupType: body.groupType || 'unknown',
        hasScreenshot: !!body.screenshot
      },
      response: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      // Note: openAISent may not exist if we errored before creating the request
      screenshot: body.screenshot,
      duration: Date.now() - startTime
    });
    
    // Return a fallback response
    return NextResponse.json({
      display_name: 'Field',
      width: 12
    });
  }
}