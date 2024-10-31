import { EMOJI_REGEX } from '../../../common/src/constants/constants';
import { IDetailZulipMessage } from '../../../common/src/models/message';
export const convertFileSize = (bytes: number) => {
  let unitIndex: number = 0;
  const s: number = 1024;
  while (bytes >= s || -bytes >= s) {
    bytes /= s;
    unitIndex++;
  }
  return (
    (unitIndex ? bytes.toFixed(1) + ' ' : bytes) + ' KMGTPEZY'[unitIndex] + 'B'
  );
};

export const convertEmojisToHtmlEntities = (text: string | undefined) => {
  const emojiToHtmlEntity = (char: string) => {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      return `&#${codePoint};`;
    }
    return char;
  };

  return text ? text.replace(EMOJI_REGEX, emojiToHtmlEntity) : '';
};

/**
 * Format content to comply with zulip quoting convention.
 * @param message : detail zulip message
 * @link: https://zulip.com/help/format-your-message-using-markdown#quotes
 */
export const formatDataToQuoteSyntax = (quote: IDetailZulipMessage) => {
  const sender = quote.message.sender_full_name;
  const senderId = quote.message.sender_id;
  return `@_**${sender}|${senderId}** said:
\`\`\`quote
${quote.raw_content}
\`\`\`

`;
};

export const formatMessageContent = (
  currentInput: string | undefined,
  uploadContent: string | undefined,
  quoteMessage: IDetailZulipMessage | null,
) => {
  const contentWithEmojis = convertEmojisToHtmlEntities(currentInput);

  const quotes = quoteMessage ? formatDataToQuoteSyntax(quoteMessage) : '';

  const final: any[] = [contentWithEmojis];
  uploadContent && final.push(uploadContent);
  quotes && final.unshift(quotes);

  return final.join('\n');
};

/**
 * Upload files in FileList object to plane, then format response's links to zulip complaint message content
 * @param files FileList object
 * @param uploadRequest api post request
 * @returns {string} uploadContent : file link in zulip message format.
 * @example "[{filename}.jpg](*.kollabridge.com/uploads/{filename}.jpg)"
 */
export const handleSendFile = async (
  files: FileList,
  uploadRequest: (formData: any) => Promise<any>,
) => {
  if (!files || !files.length) return;
  console.log('HANDLE SEND FILE ', files);
  const requests = Array.from(files).map(item => {
    console.log('ITEM FILE ', item);
    const payload = {
      file: item,
      name: item.name,
      type: item.type,
    };
    // formData.append('file', item);
    // formData.append('name', item.name);
    // formData.append('type', item.type);

    // formData.forEach((value, key) => console.log(`${key}: ${value}`));
    return uploadRequest(payload);
  });

  try {
    console.log('request zulip to upload ', requests);
    const uploads = await Promise.all(requests);
    if (uploads && uploads.length > 0) {
      const uploadContent = uploads
        .map(res => {
          if (!res.url) return;
          const content = `[${res.name || 'attachment'}](${res.url})`;
          return content;
        })
        .filter(x => x)
        .join('\n');

      return uploadContent;
    }
  } catch (error) {
    console.info('Error uploading file', error);
  }
  return;
};
