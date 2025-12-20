import { encode } from '@toon-format/toon';
import {
  AddressType,
  getaddressFromTheAi,
} from '../app/modules/chatbot/chatbot.constants';
import {
  IPreference,
  tags,
} from '../app/modules/preference/preference.interface';
import {
  HomeItem,
  Preference,
} from '../app/modules/preference/preference.model';
import { User } from '../app/modules/user/user.model';
import { chatbot } from '../config/openAIChatbot';
import { redisClient } from '../config/redis';
import { RedisHelper } from '../tools/redis/redis.helper';
import { safeParseAiJson } from '../app/modules/chatbot/chatbot.helper';

const askAI = async (prompt: string) => {
  try {
    const completion = await chatbot.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a travel recommendation engine. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });
    console.log(completion);

    const raw = completion.choices[0].message.content || '';
    const clean = raw
      .replace(/\n/g, '')
      .replace(/```json|```/g, '')
      .trim();

    return JSON.parse(clean);
  } catch (error) {
    console.log(error);
    return [];
  }
};

// ------------------- Generate type-based Suggestions -------------------
const getSuggestions = async (
  data: any,
  userAddress: { city: string; country: string },
  type: 'flight' | 'hotel' | 'activity' | 'restrudent',
  userId: string
) => {
  try {
    const prompt = await genPrompt(data, type, userAddress, userId);
    return await askAI(prompt);
  } catch (error) {
    console.log(error);
  }
};

// ------------------- Generate Prompt based on Type -------------------
const genPrompt = async (
  data: any,
  type: 'flight' | 'hotel' | 'activity' | 'restrudent',
  userAddress: { city: string; country: string },
  userId: string
) => {
  const userInfo = await User.findOne(
    { _id: userId },
    { user_type: 1, interested_categories: 1 }
  );

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
Suggest best flights. Return only JSON of the flights you recommend.`;

    case 'hotel':
      return `${base}
Available Hotels: ${JSON.stringify(data)}
Suggest best hotels. Consider price & amenities.
Return JSON only.`;

    case 'activity':
      return `${base}
Available Activities: ${JSON.stringify(data)}
Suggest best activities. Return JSON only.`;

    case 'restrudent':
      return `${base}
Available Restaurants: ${JSON.stringify(data)}
Suggest best restaurants. Return JSON only.`;

    default:
      return '';
  }
};

// ------------------- City Info Generator -------------------
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
Return JSON only in this structure: ${JSON.stringify(sampleForm)}
Don't return null/empty. Use New York defaults if unknown.
User Location: ${city}, ${country}
    `;

    return await askAI(prompt);
  } catch {
    return sampleForm;
  }
};

// ------------------- AI Home Page Suggestion Generator -------------------
const demoObj = {
  type: 'travel',
  name: 'Rome',
  referenceId: 'randomid',
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

    const userDetails = await User.findOne({ _id: preference.user })
      .select('user_type interested_categories')
      .lean();
    if (!userDetails) return [];

    const userAddress = { city: preference.city, country: preference.country };

    const userInfo = {
      user_type: userDetails.user_type,
      interested_categories: userDetails.interested_categories,
    };

    const prompt = `
User:
- Type: ${userInfo.user_type}
- Interests: ${userInfo.interested_categories}
- Location: ${userAddress.city}, ${userAddress.country}

Data:
- Hotels: ${JSON.stringify(preference.hotels)}
- Flights: ${JSON.stringify(preference.flights)}
- Activities: ${JSON.stringify(preference.activities)}

Default Images:
- Flight: https://wallpaperbat.com/img/563899-flight-wallpaper.jpg
- Hotel: https://eaglematinsurance.co.uk/wp-content/uploads/2024/08/Leisure-and-Hospitality-Insurance.jpg

Instructions:
1. Choose best recommendations based on preferences.
2. Match with user interests.
3. Use ${JSON.stringify(tags)} for tag values.
4. Convert all recommendations to this JSON format: ${JSON.stringify(demoObj)}
5. Shuffle output order.
6. Ensure no null values.
7. If booking link missing → use "".
8. if discreption missing give a description from your side and also is there is no start date or end date, use current date. for activities you can use minimumduration property.
9. if in hotels and flights the price is missing, then you can research and give the price. and if there is no start date or end date, use current date and random days from now.
Return ONLY JSON.
`;

    const data = await askAI(prompt);

    await Preference.updateOne({ user }, { aiPreferences: data });
    await HomeItem.insertMany(data?.map((item: any) => ({ ...item, user })));
    await RedisHelper.keyDelete(`preference:${user}`);

    console.log('AI suggestion completed.');
    return data;
  } catch (error) {
    console.log(error);
  }
};

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
My user type is ${
      userDetails?.user_type
    } and their interested categories are: ${userDetails?.interested_categories?.join(
      ','
    )}.
Their current location is ${address.city}, ${address.country}.

Here is their search history: ${JSON.stringify(userDetails?.searchItems)}
And their interested places: ${JSON.stringify(userDetails?.intrestedPlaces)}

Your task:
Suggest the best travel destinations that match the user’s interests and are realistically easy to travel to from their location. Focus on places where the user can explore comfortably and have meaningful experiences.

Rules:
• Return results ONLY in JSON.
• Do not include any explanation or extra text.
• Each suggestion must be unique and relevant to the user's profile.
• Include short but meaningful descriptions.
• Avoid generic or repetitive phrases.
• give tag from ${JSON.stringify(tags)} as the place preference.
• Give a bigger description.
• you can assume the price of the destination. and you can assume the duration of the trip. and start date and end date give the date nearby.
• Give minimum 30 recommendations.
• No need for images
• use valid geo coordinates
• the price will be the approximate price that if anyone visit the place they will pay for the flight hotels and activities etc.




Return the final output strictly in this JSON structure:
${JSON.stringify(demoObj)}

  `;

    const data = await askAI(prompt);

    return data;
  } catch (error) {
    console.log(error);
  }
};

const getJsonOfChatBot = async (
  prompt: string,
  countyAndTheCity: string,
  excitingMMessage: string,
  fileId?: string
) => {
  const response = await chatbot.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a travel recommendation engine. Return only valid JSON.
            SYSTEM ROLE:
You are a STRICT JSON GENERATOR.
You do NOT explain.
You do NOT format.
You do NOT improvise.

ABSOLUTE OUTPUT CONTRACT (HIGHEST PRIORITY)
====================================================================
1. OUTPUT MUST BE VALID JSON.
2. OUTPUT MUST MATCH THE REQUIRED JSON STRUCTURE EXACTLY.
3. YOU MUST NOT:
   - add fields
   - remove fields
   - rename fields
   - reorder fields
   - nest fields differently
   - change array order
   - change number formats
   - change string values
4. IF YOU CANNOT COMPLY EXACTLY:
   → RETURN THE LAST VALID JSON **UNCHANGED**.
5. NEVER wrap JSON in markdown.
6. NEVER output text outside JSON.
            
            `,
      },
      {
        role: 'user',
        content: getaddressFromTheAi(
          `${prompt || fileId} and my previous messages are ${JSON.stringify(
            excitingMMessage
          )}`
        ),
      },
    ],
  });

  const data = response.choices[0].message.content;
  // const information:AddressType = JSON.parse(data!);
console.log(data);

  const jsonFormat = data
    ?.replace(/\n/g, '')
    .replace(/```json|```/g, '')
    .trim();

    

  const json: AddressType = JSON.parse(jsonFormat!);


  return json;
};

export const AiHelper = {
  getSuggestions,
  getCityInfo,
  createAiSuggestion,
  createAiSuggestionTravelDestination,
  getJsonOfChatBot,
};
