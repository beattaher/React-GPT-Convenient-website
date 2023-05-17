// tokenCountHelper.js

const tokenCounter = (textArray) => {
  const CHINESE_CHARACTER_REGEX = /[\u4e00-\u9fff]/;

  // 计算英文单词数量和中文字符数量
  let totalCount = 0;
  textArray.forEach(message => {
    const text = message.content;

    // 计算英文单词数量
    const wordCount = text.split(/\s+/)
      .filter(word => !CHINESE_CHARACTER_REGEX.test(word))
      .length;

    // 计算中文字符数量
    const chineseCharacterCount = Array.from(text).reduce((count, char) => {
      if (CHINESE_CHARACTER_REGEX.test(char)) {
        count += 2;
      }
      return count;
    }, 0);

    totalCount += wordCount + chineseCharacterCount;
  });

  console.log("word number", totalCount);
  return totalCount;
};

export { tokenCounter };
