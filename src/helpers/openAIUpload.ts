import path, { extname } from 'path';
import fs from 'fs';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

import config from '../config';
import { chatbot } from '../config/openAIChatbot';

export const openAiFileUpload = async (file: string) => {

    
  try {
    if(!file){
        return ""
    }


    const filePath = path.join(process.cwd(), 'uploads', file);
        if([".mp3","wav"].includes(extname(file))){
        const transcribeResponse = await chatbot.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
        })

        return transcribeResponse.text
    }
    const response = await chatbot.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });



    return response.id;
  } catch (error) {
    return null;
  }
};
