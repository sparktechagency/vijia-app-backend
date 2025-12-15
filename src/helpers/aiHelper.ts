import { encode } from '@toon-format/toon';
import { AddressType, getaddressFromTheAi } from '../app/modules/chatbot/chatbot.constants';
import { IPreference, tags } from '../app/modules/preference/preference.interface';
import { HomeItem, Preference } from '../app/modules/preference/preference.model';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { redisClient } from '../config/redis';
import { RedisHelper } from '../tools/redis/redis.helper';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatbot } from '../config/chatbot.config';

/* ------------------------------------------------------------------ */
/* Gemini Configuration                                               */
/* ------------------------------------------------------------------ */

const geminiModel = chatbot

/* ------------------------------------------------------------------ */
/* AI Helper                                                          */
/* ------------------------------------------------------------------ */

const askAI = async (prompt: string) => {
  try {
    const result = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
You are a system that MUST return only valid JSON.
Do not add explanations, markdown, or extra text.

${prompt}
              `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const raw = result.response.text();

    const clean = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(clean);
  } catch (error) {
    console.error('Gemini AI error:', error);
    return [];
  }
};


/* ------------------------------------------------------------------ */
/* Generate Type-based Suggestions                                    */
/* ------------------------------------------------------------------ */

const getSuggestions = async (
  data: any,
  userAddress: { city: string; country: string },
  type: 'flight' | 'hotel' | 'activity' | 'restaurant',
  userId: string
) => {
  try {
    const prompt = await genPrompt(data, type, userAddress, userId);
    return await askAI(prompt);
  } catch (error) {
    console.log(error);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* Prompt Generator                                                   */
/* ------------------------------------------------------------------ */

const genPrompt = async (
  data: any,
  type: 'flight' | 'hotel' | 'activity' | 'restaurant',
  userAddress: { city: string; country: string },
  userId: string
) => {
  const userInfo = await User.findOne(
    { _id: userId },
    { user_type: 1, interested_categories: 1 }
  ).lean();

  const base = `
User Profile:
- Type: ${userInfo?.user_type || 'none'}
- Interests: ${userInfo?.interested_categories?.join(', ') || 'none'}
- Location: ${userAddress.city}, ${userAddress.country}
`;

  switch (type) {
    case 'flight':
      return `${base}
Available Flights: ${JSON.stringify(data)}
Suggest best flights.
Return JSON only.`;

    case 'hotel':
      return `${base}
Available Hotels: ${JSON.stringify(data)}
Suggest best hotels considering price and amenities.
Return JSON only.`;

    case 'activity':
      return `${base}
Available Activities: ${JSON.stringify(data)}
Suggest best activities.
Return JSON only.`;

    case 'restaurant':
      return `${base}
Available Restaurants: ${JSON.stringify(data)}
Suggest best restaurants.
Return JSON only.`;

    default:
      return '';
  }
};

/* ------------------------------------------------------------------ */
/* City Info Generator                                                */
/* ------------------------------------------------------------------ */

const sampleForm = {
  city: 'PAR',
  country: 'FR',
  suggestCountrys: [{ city: 'PAR', country: 'FR' }],
};

const getCityInfo = async (
  city: string,
  country: string
): Promise<typeof sampleForm> => {
  try {
    const prompt = `
Return JSON only in this structure:
${JSON.stringify(sampleForm)}

Do not return null or empty values.
If unknown, use New York defaults.

User Location: ${city}, ${country}
`;

    return await askAI(prompt);
  } catch {
    return sampleForm;
  }
};

/* ------------------------------------------------------------------ */
/* AI Home Page Suggestions                                           */
/* ------------------------------------------------------------------ */

export const demoObj = {
  type: 'travel',
  name: '',
  referenceId: '',
  images: [],
  description: '',
  price: 0,
  currency: '',
  isDiscounted: false,
  discountPercentage: 0,
  discountAmount: 0,
  tags: '',
  bookingLink: '',
  startDate: '',
  endDate: '',
  country: '',
  city: '',
  lat: 0,
  lng: 0,
};

const createAiSuggestion = async (user: string) => {
  try {
    console.log('AI is processing... please wait.');

    const preference = await Preference.findOne({ user }).lean();
    if (!preference) return [];

    const userDetails = await User.findOne(
      { _id: preference.user },
      { user_type: 1, interested_categories: 1 }
    ).lean();
    if (!userDetails) return [];

    const userAddress = {
      city: preference.city,
      country: preference.country,
    };

    const prompt = `
User:
- Type: ${userDetails.user_type}
- Interests: ${userDetails.interested_categories}
- Location: ${userAddress.city}, ${userAddress.country}

Data:
- Hotels: ${JSON.stringify(preference.hotels)}
- Flights: ${JSON.stringify(preference.flights)}
- Activities: ${JSON.stringify(preference.activities)}

Instructions:
1. Choose best recommendations based on user preferences.
2. Match user interests.
3. Use tags only from: ${JSON.stringify(tags)}
4. Convert every item into this structure:
${JSON.stringify(demoObj)}
5. Shuffle the output.
6. No null values.
7. Missing booking link → empty string.
8. If description missing, generate one.
9. If dates missing, use near future dates.
10. Assume price if missing.

Return ONLY JSON.
`;

    const data = await askAI(prompt);

    await Preference.updateOne({ user }, { aiPreferences: data });
    await HomeItem.insertMany(data.map((item: any) => ({ ...item, user })));
    await RedisHelper.keyDelete(`preference:${user}`);

    console.log('AI suggestion completed.');
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* Travel Destination Suggestions                                     */
/* ------------------------------------------------------------------ */

const createAiSuggestionTravelDestination = async (
  user: string,
  address: { city: string; country: string }
) => {
  try {
    console.log('AI is processing... please wait.');

    const userDetails = await User.findOne(
      { _id: user },
      {
        user_type: 1,
        interested_categories: 1,
        searchItems: 1,
        intrestedPlaces: 1,
      }
    ).lean();

    if (!userDetails) return [];

    const prompt = `
User type: ${userDetails.user_type}
Interests: ${userDetails.interested_categories?.join(', ')}

Current Location: ${address.city}, ${address.country}

Search history:
${JSON.stringify(userDetails.searchItems)}

Interested places:
${JSON.stringify(userDetails.intrestedPlaces)}

Task:
Suggest travel destinations that match the user's interests and are easy to travel to.

Rules:
- Return ONLY JSON
- Minimum 30 unique recommendations
- No images
- Use tags from ${JSON.stringify(tags)}
- Provide long descriptions
- Assume price, duration, start and end dates
- Use valid latitude and longitude
- No null values

Output structure:
${JSON.stringify(demoObj)}
`;

    return await askAI(prompt);
  } catch (error) {
    console.log(error);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* Export                                                             */
/* ------------------------------------------------------------------ */



const getJsonOfChatBot = async (
  prompt: string,
  countyAndTheCity: string,
  excitingMMessage: string,
  fileId?: string
) => {
  try {
    const finalPrompt = getaddressFromTheAi(
      `${prompt || fileId} and my current location is ${encode(
        countyAndTheCity
      )} and my previous messages are ${encode(excitingMMessage)}`
    );

    const result = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
You are a travel recommendation engine.
Return ONLY valid JSON.
Do not include markdown or extra text.

${finalPrompt}
              `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const raw = result.response.text();
    console.log(raw);
    
    const clean = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const json: AddressType = JSON.parse(clean);

    return json;
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw error;
  }
};


export const AiHelper = {
  getSuggestions,
  getCityInfo,
  createAiSuggestion,
  createAiSuggestionTravelDestination,
  getJsonOfChatBot
};
