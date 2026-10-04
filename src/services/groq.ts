export async function fetchGroqCompletion(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Не найден VITE_GROQ_API_KEY в переменных окружения (.env).",
    );
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  const data: {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  } = await response.json();

  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  return "Пустой ответ от сервера.";
}
