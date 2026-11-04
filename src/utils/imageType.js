const IMAGE_SIGNATURES = [
  { extension: 'jpg', matches: (buffer) => buffer.subarray(0, 3).toString('hex') === 'ffd8ff' },
  { extension: 'png', matches: (buffer) => buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' },
  { extension: 'gif', matches: (buffer) => buffer.subarray(0, 4).toString('latin1') === 'GIF8' },
  {
    extension: 'webp',
    matches: (buffer) =>
      buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP',
  },
];

// Kiểm tra theo nội dung file vì tên file và mimetype do client gửi lên có thể bị giả mạo
export function detectImageExtension(buffer) {
  return IMAGE_SIGNATURES.find(({ matches }) => matches(buffer))?.extension;
}
