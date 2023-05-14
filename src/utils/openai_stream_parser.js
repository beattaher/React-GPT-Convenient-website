processStream = async () => {
    const { done, value } = await reader.read();

    if (done) {
      // Stream has ended; return the result
      return result;
    }

    const text = new TextDecoder("utf-8").decode(value);
    const lines = text?.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (message === "[DONE]") {
        await reader.cancel(); // Stop reading the stream
        break; // Stream finished
      }
      try {
        const parsed = JSON.parse(message);
        result += parsed.choices[0].text; // Append the choice text to the result
      } catch (error) {
        console.error("Could not JSON parse stream message", message, error);
      }
    }

    return processStream(); // Continue processing the stream
  };