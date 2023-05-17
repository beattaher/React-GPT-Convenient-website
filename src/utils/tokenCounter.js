// tokenCountHelper.js

const tokenCounter = (textArray) => {
  let text = textArray[textArray.length - 1].content;
  console.log("in counter text",text);
  const CHINESE_CHARACTER_REGEX = /[\u4e00-\u9fff]/;

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

  return wordCount + chineseCharacterCount;
};

export {tokenCounter};
