const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: JSON.stringify(files.map(file => ({
            name: file.name,
            content: file.content
          })))
        }
      ],
      max_tokens: 10000,
      temperature: 0.1
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('未收到GPT-4o响应');
    }

    // 检查是否为纯文本错误消息
    const errorKeywords = ['抱歉', '无法处理', '无法分析', '无法识别', '不能', '错误'];
    const isPlainTextError = errorKeywords.some(keyword => result.includes(keyword)) && 
                            !result.trim().startsWith('{') && 
                            !result.trim().startsWith('[');
    
    if (isPlainTextError) {
      throw new Error(`AI处理失败: ${result}`);
    }

    // 解析JSON响应
    let parsedResult;
    try {
      // 提取JSON部分（可能包含在代码块中）
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : result;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      throw new Error(`GPT-4o返回的数据格式错误。原始响应: ${result.substring(0, 200)}...`);
    }