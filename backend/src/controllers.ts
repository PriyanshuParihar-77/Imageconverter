import { Request, Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { decode } from 'punycode';

// A utility function to validate the format is one of Sharp's supported formats
const isValidFormat = (format: any): format is keyof sharp.FormatEnum => {
  return ['png', 'jpeg', 'jpg', 'webp', 'tiff', 'gif', 'avif'].includes(format);
};

// Process the uploaded image
export const processImage = async (req: Request, res: Response) => {
  try {
    const { brightness = 1, contrast = 1, saturation = 1, rotation = 0 } = req.body;
    const imagePath = req.file?.path;

    if (!imagePath) return res.status(400).send('No image uploaded.');

    // Process image for preview (lower quality)
    const processedImagePath = `upload/processed-${req.file?.filename}.png`;
    await sharp(imagePath)
      .resize(800) // Resize the image
      .modulate({ brightness: parseFloat(brightness), saturation: parseFloat(saturation) })
      .linear(parseFloat(contrast), 0) // Apply contrast adjustment
      .rotate(parseFloat(rotation))
      .toFormat('png')
      .toFile(processedImagePath);

    res.json({ imageUrl: `/download?imageUrl=${encodeURIComponent(processedImagePath)}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process image' });
  }
};

// Generate a preview of the uploaded image
export const getPreview = async (req: Request, res: Response) => {
  try {
    console.log("hiiiiiii");
    const { brightness = 1, contrast = 1, saturation = 1, rotation = 0 } = req.body;
    const imagePath = req.file?.path;

    if (!imagePath) return res.status(400).send('No image uploaded.');

    // Create a preview of the image using Sharp
    const previewImagePath = `upload/preview-${req.file?.filename}.png`;
    await sharp(imagePath)
      .resize(200) // Resize for preview
      .modulate({ brightness: parseFloat(brightness), saturation: parseFloat(saturation) })
      .linear(parseFloat(contrast), 0) // Apply contrast adjustment
      .rotate(parseFloat(rotation))
      .toFormat('png')
      .toFile(previewImagePath);

    res.sendFile(path.resolve(previewImagePath), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to send preview image.');
      } else {
        fs.unlinkSync(previewImagePath); // Clean up preview image after sending
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
};

// Handle image download with format conversion
export const downloadImage = async (req: Request, res: Response) => {
  const { format, imageUrl } = req.query;

  try {
    // Decode the image URL and get the full path
    const decodedImageUrl = decodeURIComponent(imageUrl as string);
   let parts = decodedImageUrl.split("/");
   const imageFileName = parts[parts.length - 1]; 
    const imagePath = path.resolve(__dirname, `../upload/${imageFileName}`);
    console.log(decodedImageUrl);
    console.log(imagePath);
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send({ error: 'File not found' });
    }

    // Validate the format, default to 'png'
    const validFormat = isValidFormat(format) ? format : 'png';

    // Convert and send the image
    const imageBuffer = await sharp(imagePath)
      .toFormat(validFormat) // Convert to valid format
      .toBuffer();

    res.set('Content-Disposition', `attachment; filename="image.${validFormat}"`);
    res.set('Content-Type', `image/${validFormat}`);
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).send({ error: 'Failed to download the image' });
  }
};
