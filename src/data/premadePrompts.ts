import type { Prompt } from '../types';

export const PREMADE_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Receive longer outputs',
    category: 'productivity',
    description: 'Please continue.',
    content: 'Please continue.',
    icon: '📝'
  },
  {
    id: '2',
    title: 'Persona usage',
    category: 'learning',
    description: "You are a data analyst whose job is to analyze a company's data...",
    content: "You are a data analyst whose job is to analyze a company's data in new and innovative ways to test assumptions and hypotheses about the company's customers and product. What areas of the company would you focus on to test your assumption that people who engage with the company on social media are more likely to buy new products?",
    icon: '👤'
  },
  {
    id: '3',
    title: 'Alter verbiage',
    category: 'writing',
    description: 'Summarize in plain language the following information: <add information>',
    content: 'Summarize in plain language the following information: <add information>',
    icon: '✍️'
  },
  {
    id: '4',
    title: 'Describe the task',
    category: 'writing',
    description: 'This is an article followed by a summary written in informal language...',
    content: "This is an article followed by a summary written in informal language:\n<input article content> Summary in plain language:",
    icon: '📋'
  },
  {
    id: '5',
    title: 'Include context',
    category: 'productivity',
    description: 'This is a conversation between a customer and a friendly, helpful customer support representative...',
    content: "This is a conversation between a customer and a friendly, helpful customer support representative.\nCustomer: <input customer question> Customer representative:",
    icon: '🤝'
  },
  {
    id: '6',
    title: 'Use indicators',
    category: 'productivity',
    description: 'Using the following input, generate an opinion about the content of the input...',
    content: "Using the following input, generate an opinion about the content of the input. Input: Microsoft could soon get a return on its $1 billion investment in OpenAI, creator of the ChatGPT chatbot, which gives humanlike text answers to questions. Microsoft is preparing to launch a version of its Bing search engine that uses the artificial intelligence behind ChatGPT to answer some search queries rather than just showing a list of links, according to two people with direct knowledge of the plans. Microsoft hopes the new feature, which could launch before the end of March, will help it outflank Google, its much bigger search rival.\nOutput:",
    icon: '📊'
  },
  {
    id: '7',
    title: 'Use variables',
    category: 'writing',
    description: 'Write a sales call follow up email in a familiar tone using the following inputs...',
    content: "Write a sales call follow up email in a familiar tone using the following inputs: Customer name: John Smith\nCompany: Amazon\nCall action items: ask about his vacation, extend special pricing terms, schedule follow up call\nOutput:",
    icon: '📧'
  },
  {
    id: '8',
    title: 'Templatized examples',
    category: 'productivity',
    description: 'Generate a review for dish called Crab Samosas...',
    content: "Generate a review for dish called Crab Samosas:\nCrab Samosas (5/5): Hesitant to order this because of the small size and hefty price ($16) for 4 samosas, I was pleasantly surprised. Almost every Yelp review raves about this, and this is one of them. The flavor explosion is something else. The samosa dipped with the mango habanero chutney and the garlic infused raita is, as they say, chef's kiss. Highly highly recommend.\nGenerate a review for a dish called Jungle Curry:\nJungle Curry (3/5): We were excited about this one, but were disappointed by how dry the meat was. It helped to dunk the meat in the thin curry sauce, but it still came out resembling  jerky, texture wise. The sauce itself had a strong lemongrass taste, which isn't for everyone. I love lemongrass and it was just a bit too much for me. This comes with vegetables in the curry along with a side of rice.\nGenerate a review for a dish called Beef Cheek Ravioli:",
    icon: '⭐'
  },
  {
    id: '9',
    title: 'Tone & voice',
    category: 'writing',
    description: 'Feeling the burn in my legs and the wind in my hair! Biking not only gives me a great workout...',
    content: "Feeling the burn in my legs and the wind in my hair! Biking not only gives me a great workout, but it's also good for the environment and my mental health. #biking #exercise #healthyliving\nAnalyze the above text for style, voice, and tone.\nWrite a new caption about the benefits of drinking matcha using the same style, voice, and tone.",
    icon: '🗣️'
  },
  {
    id: '10',
    title: 'Specify formatting',
    category: 'writing',
    description: 'Give a bulleted list of to-do items for my weekend chores around the house.',
    content: 'Give a bulleted list of to-do items for my weekend chores around the house.',
    icon: '✅'
  },
  {
    id: '11',
    title: 'Writing mediums',
    category: 'productivity',
    description: 'Generate a compelling marketing email about a free music concert...',
    content: 'Generate a compelling marketing email about a free music concert that urges readers to register and support local artists.',
    icon: '📨'
  },
  {
    id: '12',
    title: 'Specifying length',
    category: 'writing',
    description: 'Write a 280-character witty Tweet about Meta and the Metabase.',
    content: 'Write a 280-character witty Tweet about Meta and the Metabase.',
    icon: '📏'
  },
  {
    id: '13',
    title: 'Non-generic responses',
    category: 'productivity',
    description: 'Give me the opposing opinion to the idea that using copyright-protected work...',
    content: 'Give me the opposing opinion to the idea that using copyright-protected work to train AI models is covered under the Fair Use doctrine.',
    icon: '⚖️'
  },
  {
    id: '14',
    title: 'Audience framing',
    category: 'learning',
    description: "Explain how diffusion models work like I'm a 5th grader",
    content: "Explain how diffusion models work like I'm a 5th grader",
    icon: '👶'
  },
  {
    id: '15',
    title: 'Technique priming',
    category: 'creative',
    description: "Create an ad for Dr.Pepper, using John Coleman's copywriting strategies.",
    content: "Create an ad for Dr.Pepper, using John Coleman's copywriting strategies.",
    icon: '📢'
  },
  {
    id: '16',
    title: 'Define principles',
    category: 'coding',
    description: 'Using the following principles of making a viral TikTok, create a video script...',
    content: "Using the following principles of making a viral TikTok, create a video script about a new product launch for a t shirt company.\n#1: Make Your Brand Memorable by Telling Stories on TikTok #2: Tell a Complete Story in 15 Seconds\n#3: Write an Effective Caption for Your TikTok Video\nScript:",
    icon: '🎬'
  },
  {
    id: '17',
    title: 'Request tone usage',
    category: 'writing',
    description: 'Write a paragraph explaining how the branches of government works in a sarcastic tone.',
    content: 'Write a paragraph explaining how the branches of government works in a sarcastic tone.',
    icon: '🎭'
  },
  {
    id: '18',
    title: 'Request style usage',
    category: 'writing',
    description: 'Write a paragraph explaining how the branches of government works in a persuasive style',
    content: 'Write a paragraph explaining how the branches of government works in a persuasive style',
    icon: '✒️'
  },
  {
    id: '19',
    title: 'Pop culture references',
    category: 'productivity',
    description: 'Generate a "dad joke" about scarecrows.',
    content: 'Generate a "dad joke" about scarecrows.',
    icon: '😂'
  },
  {
    id: '20',
    title: 'Rewrite content',
    category: 'coding',
    description: 'Rewrite this to be more concise and compelling...',
    content: "Rewrite this to be more concise and compelling: The word expository contains the word expose, so the reason expository is an apt descriptor for this type of writing is that it exposes, or sets forth, facts. It is probably the most common writing genre you will come across throughout your day. In an expository piece, a topic will be introduced and laid out in a logical order without reference to the author's personal opinions.Expository writing can be found in: Textbooks, Journalism (except for opinion and editorial articles), Business writing, Technical writing, & Essays Instructions.\nOutput:",
    icon: '🔄'
  },
  {
    id: '21',
    title: 'Multi-step output',
    category: 'writing',
    description: 'Generate an outline for a blog post about training your dog to sit...',
    content: "Generate an outline for a blog post about training your dog to sit.\n---\nWrite the body for section I-A above:",
    icon: '🪜'
  },
  {
    id: '22',
    title: 'Specify structure',
    category: 'coding',
    description: 'Using a structure which includes a hook, body, and call to action...',
    content: "Using a structure which includes a hook, body, and call to action, generate a TikTok script for why people should walk more often.",
    icon: '🏗️'
  },
  {
    id: '23',
    title: 'Enumerate the goal',
    category: 'writing',
    description: 'The goal of my blog post is to: motivate the reader to take action...',
    content: "The goal of my blog post is to: motivate the reader to take action\nWrite a blog post about the benefits of recycling with the above goal in mind.",
    icon: '🎯'
  },
  {
    id: '24',
    title: 'Restructure text',
    category: 'writing',
    description: 'Rewrite the following open and closing times of popular restaurants...',
    content: "Rewrite the following open and closing times of popular restaurants into a consistent format:\nSchedule: M-F 8am-9pm, Sat 10am-midnight, S noon-6pm Output:\nM: 8:00 AM - 9:00 PM\nT: 8:00 AM - 9:00 PM\nW: 8:00 AM - 9:00 PM\nTh: 8:00 AM - 9:00 PM\nF: 8:00 AM - 9:00 PM\nSat: 10:00 AM - 12:00 AM\nSun: 12:00 PM - 6:00 PM\nSchedule: M-Th 7am-noon, F 10am-5pm, Sat & Sun 9am-4pm Output:",
    icon: '📊'
  },
  {
    id: '25',
    title: 'Remove pre-text',
    category: 'productivity',
    description: 'Remove the dollar signs from the prices in the following content...',
    content: "Remove the dollar signs from the prices in the following content:\nOur product is $35 per month and or you can purchase it on an annual commitment for $25 per year.",
    icon: '✂️'
  },
  {
    id: '26',
    title: 'Remove pieces',
    category: 'productivity',
    description: 'Remove the hashtags in the following social media post...',
    content: "Remove the hashtags in the following social media post: Summer days are the best when they include all the #doglove! Whether it's playing fetch in the park, going for a swim, or just lounging in the sun, #puppies make these hot days so much more fun. Get out there and #loveyourdog this season! #SummerFun #DogsInSummer #PupsInThePark #CutenessOverload #NationalDogDay",
    icon: '🗑️'
  },
  {
    id: '27',
    title: 'Change pov',
    category: 'writing',
    description: "Are you tired of fighting traffic? Rewrite to be in perspective of customer...",
    content: "Are you tired of fighting traffic and dealing with the hassle of driving every day? It's time to upgrade to a better mode of transportation – and our newest bicycle is the perfect choice!\nNot only is this bike stylish and sleek, but it's also loaded with top-of-the-line features that make every ride a breeze. From its lightweight frame and durable tires, to its responsive brakes and smooth gears, you'll feel confident and in control no matter where you go.\nBut the best part? This bike is an affordable, eco-friendly way to get around town. So why not ditch the car and start enjoying your daily commute? Trust us, you won't be disappointed. Upgrade to the newest bicycle today and join the ranks of happy riders who are making a difference one pedal stroke at a time.\nRewrite the above content to be in the perspective of a customer who has already purchased the product.",
    icon: '👀'
  },
  {
    id: '28',
    title: 'Change verb tense',
    category: 'writing',
    description: 'Rewrite the above call notes in the past tense...',
    content: "I'm speaking with John, who is the manager at Great Co. He is reporting that they are experiencing issues with their website, which is not loading properly for customers. We are troubleshooting the issue now and trying to determine the cause. John is also mentioning that they have had some downtime in the past week, which may be related. I am suggesting that we look into the server logs to see if there are any errors or issues that may have caused the website issues and the downtime. John agrees and is going to send over the log files for me to review. We are going to schedule a follow-up call for tomorrow to discuss our findings and come up with a plan to resolve the issues.\nRewrite the above call notes in the past tense:",
    icon: '⏳'
  },
  {
    id: '29',
    title: 'Citing sources',
    category: 'writing',
    description: 'Find, summarize in bullet points, and cite a source on why companies should hire virtual assistants.',
    content: 'Find, summarize in bullet points, and cite a source on why companies should hire virtual assistants.',
    icon: '📖'
  },
  {
    id: '30',
    title: 'Prompt variations',
    category: 'writing',
    description: 'Generate 10 variations of the following command to a large language model...',
    content: 'Generate 10 variations of the following command to a large language model: "Find, summarize in bullet points, and cite a source on why companies should hire virtual assistants."',
    icon: '🔀'
  },
  {
    id: '31',
    title: 'Combining sources',
    category: 'coding',
    description: 'Generate a job specific cover letter using the following job description and applicant resume...',
    content: "Generate a job specific cover letter using the following job description and applicant resume:\nJob description:\nWe are seeking a skilled and analytical Data Analyst to join our team. In this role, you will be responsible for collecting, organizing, and analyzing large sets of data to identify trends and patterns. You will work closely with the data science and business teams to understand their data needs and help them make informed decisions based on your insights. Responsibilities include: Collect and process large sets of data from a variety of sources, clean and prepare data for analysis, use statistical and analytical techniques to identify trends and patterns in data, and communicate findings and insights to the data science and business teams\nApplicant resume:\nDynamic and results-driven Data Analyst with over 5 years of experience in the industry. Skilled in collecting, cleaning, and analyzing large sets of data to identify trends and patterns. Proven track record of success at leading tech companies such as Google and Facebook. Passionate about using data to drive business decisions and solve complex problems. In my free time, I enjoy hiking and exploring the great outdoors.\nExperience:\nData Analyst, Google (2018-Present)\n• Analyzed large sets of data to identify trends and patterns that informed product development and marketing strategies\n• Developed and implemented data-driven solutions to improve business processes and increase efficiency\n• Collaborated with cross-functional teams to understand data needs and communicate findings\nCover letter:",
    icon: '📄'
  },
  {
    id: '32',
    title: 'Character specific responses',
    category: 'creative',
    description: 'You are an AI system that has been trained on Steve Jobs biography...',
    content: 'You are an AI system that has been trained on Steve Jobs\' biography. What do you think about the current explosion in AI technology and generative AI?',
    icon: '🎭'
  },
  {
    id: '33',
    title: 'Character specific audience',
    category: 'learning',
    description: 'Talk to me like I\'m Peter Pan and explain why kids should listen to their parents.',
    content: 'Talk to me like I\'m Peter Pan and explain why kids should listen to their parents.',
    icon: '🧚'
  },
  {
    id: '34',
    title: 'Communication styles by job',
    category: 'writing',
    description: 'I want you to act as a motivational coach...',
    content: "I want you to act as a motivational coach. I will provide you with information regarding someone's goals and challenges, and your job is to come up with strategies that can help this person achieve their goals. This involves providing positive affirmations, giving helpful advice or suggesting activities they can do to reach their end goal. My first request is \"I need help motivating myself to keep going to the gym even though I am tired\"",
    icon: '📣'
  },
  {
    id: '35',
    title: 'Product oriented tasks',
    category: 'productivity',
    description: 'I want you to act as a dog name generator...',
    content: "I want you to act as a dog name generator. I will type dog breeds separated by commas and you will reply with three dog name options for each breed I give. My first breeds are poodle, chocolate lab, and husky.",
    icon: '🐶'
  },
  {
    id: '36',
    title: 'Strengths & weaknesses',
    category: 'productivity',
    description: 'Weigh the strengths and weaknesses of using virtual assistants...',
    content: 'Weigh the strengths and weaknesses of using virtual assistants to help you with your daily tasks.',
    icon: '⚖️'
  },
  {
    id: '37',
    title: 'User experiences',
    category: 'coding',
    description: 'Give me some bullet points of what the user experience would be like for a home delivery prescription business.',
    content: 'Give me some bullet points of what the user experience would be like for a home delivery prescription business.',
    icon: '📱'
  },
  {
    id: '38',
    title: 'Merits of an opinion',
    category: 'productivity',
    description: 'What are the merits of the opinion that training AI systems on copyright-protected text...',
    content: 'What are the merits of the opinion that training AI systems on copyright-protected text is covered under the Fair Use doctrine and would not be considered copyright infringement?',
    icon: '🤔'
  },
  {
    id: '39',
    title: 'Generate okrs',
    category: 'productivity',
    description: 'Generate a social media agency\'s OKRs for one month...',
    content: "Generate a social media agency's OKRs for one month that encompass their goals as follows:\n- Provide world class customer service to our clients\n- Generate results that are efficient and effective",
    icon: '📈'
  },
  {
    id: '40',
    title: 'Brainstorm prompts',
    category: 'productivity',
    description: 'Brainstorm 10 commands I would submit to a large language model...',
    content: 'Brainstorm 10 commands I would submit  to a large language model to have the model generate varied content for my dog portrait business',
    icon: '🧠'
  },
  {
    id: '41',
    title: 'Customize to your voice',
    category: 'writing',
    description: 'You are an AI system that has been trained to analyze the below text for style...',
    content: "You are an AI system that has been trained to analyze the below text for style, voice, and tone then use NLP to create a VoiceParagraph. A VoiceParagraph prompts a future AI system to write in that same style, voice and tone. Here is the input text: [add text]",
    icon: '🎙️'
  },
  {
    id: '42',
    title: 'Common answers',
    category: 'productivity',
    description: 'What are 7 of the most common things people do to motivate themselves to wake up early?',
    content: 'What are 7 of the most common things people do to motivate themselves to wake up early?',
    icon: '⏰'
  },
  {
    id: '43',
    title: 'Python instruction template',
    category: 'coding',
    description: 'Use this format: <python 3 shebang>...',
    content: "Use this format:\n'''\n<python 3 shebang>\n<module docstring>\n<imports>\n<initialize dotenv>\n<set key using OPENAI_API_KEY env var>\ndef complete(prompt: str, **openai_kwargs) → str:\n<one-line docstring; no params>\n<use default kwargs: model=text-davinci-003,top_p=0.7,max_tokens=512>\n<note: 'engine' parameter is deprecated>\n<get completion>\n<strip whitespace before returning>\nWrite code to call the OpenAI API and create a reusable function to pass prompts:",
    icon: '🐍'
  }
];
