/**
 * From ChatGPT
 * Run length encoder
 */
export function encode(input: string): string {
  let encoded = "";
  let i = 0;

  while (i < input.length) {
    let count = 0;
    let currentChar = input[i];

    // Check if there's an existing count in the string (i.e., it’s partially encoded)
    if (!isNaN(parseInt(currentChar))) {
      while (i < input.length && !isNaN(parseInt(input[i]))) {
        encoded += input[i];
        i++;
      }
      currentChar = input[i];
      encoded += currentChar;
      i++;
      continue;
    }

    // Count consecutive occurrences of current character
    while (i < input.length && input[i] === currentChar) {
      count++;
      i++;
    }
    encoded += count > 1 ? `${count}${currentChar}` : currentChar;
  }

  return encoded;
}
