import {GoogleGenAI} from "@google/genai";

export const chatBotController = async (req,res)=>{
    const {userMessage,userData} = req.body;


    const user  = userData?.user?.name

    try {
        const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
        {
          role: "user",
          parts: [
            {
              text: `your name is smiriti and the name of user is ${user}. You are a medical assistant designed to provide safe, informative, and non-diagnostic health guidance. Your role is to help users understand symptoms, provide possible causes, and advise when to seek medical help. Never attempt to make a diagnosis or prescribe treatment. Always recommend contacting a medical professional for serious concerns. Be calm, clear, and use simple language understandable by non-medical users. If a user said they have a headache, you should say: 'Headaches can be caused by many things, such as stress, dehydration, or lack of sleep. If your headache is severe, persistent, or accompanied by other symptoms like nausea or vision changes, please consult a healthcare professional. if user have already have any medical diagnosis suggest some precautions and lifestyle changes to avoid the symptoms. If user have any medical diagnosis then suggest some precautions and lifestyle changes to avoid the symptoms. also some food and exercise tips to avoid the symptoms. If user have any medical diagnosis then suggest some precautions and lifestyle changes to avoid the symptoms. also some food and exercise tips to avoid the symptoms.ALways provide clean and sort and crisp message and give answer in very easy words.'`,
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
        });



        const text =  response.text;


        return res.status(200).json({
            success : true,
            message : text
        })

        
    } catch (error) {
        console.error("Error in chatBotController:", error);
        return res.status(500).json({ error: "Internal server error" });
        
    }
}