const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'
const MINIMAX_MODEL = 'MiniMax-M2.7'

interface GenerateNovelParams {
  genre: string
  style: string
  setting?: string
  prompt: string
  previousContent?: string
  choices?: string[]
}

export async function generateNovelContent(params: GenerateNovelParams): Promise<string> {
  const { genre, style, setting, prompt, previousContent, choices } = params

  let systemPrompt = `你是一位专业的网络小说作家，擅长写${genre}类型的小说。
你的写作风格是${style}。
请根据用户的要求创作小说内容。要求：
1. 情节引人入胜，有悬念
2. 人物形象鲜明
3. 文笔流畅，可读性强
4. 每章约1000-2000字`

  if (setting) {
    systemPrompt += `\n故事背景设定：${setting}`
  }

  let userPrompt = prompt

  if (previousContent) {
    userPrompt = `前文内容：\n${previousContent}\n\n请继续创作：${prompt}`
  }

  if (choices && choices.length > 0) {
    userPrompt += `\n\n故事走向选项：\n${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n请选择一个方向继续创作。`
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax API error: ${error}`)
  }

  const data = await response.json()
  if (!data.choices || data.choices.length === 0) {
    const errMsg = data.base_resp?.status_msg || 'Unknown error'
    throw new Error(`MiniMax API error: ${errMsg}`)
  }
  return data.choices[0].message.content
}

export async function generateChapterChoices(
  genre: string,
  currentContent: string
): Promise<string[]> {
  const systemPrompt = `你是一位创意故事策划师。根据当前小说内容，为读者提供3-5个有趣的故事走向选项。
每个选项应该：
1. 引发不同的剧情发展
2. 有足够的好奇心驱使读者选择
3. 符合${genre}类型小说的特点

请直接返回选项列表，每行一个，不要编号。`

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `当前小说内容：\n${currentContent}` },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate choices')
  }

  const data = await response.json()
  if (!data.choices || data.choices.length === 0) {
    const errMsg = data.base_resp?.status_msg || 'Unknown error'
    throw new Error(`MiniMax API error: ${errMsg}`)
  }
  const choicesText = data.choices[0].message.content
  return choicesText.split('\n').filter((c: string) => c.trim()).map((c: string) => c.replace(/^\d+[\.\、]\s*/, ''))
}