'use client';

import { useState, useEffect } from 'react';
import exifr from 'exifr';

export default function UploadPage() {
  const [albums, setAlbums] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    album_id: '',
    featured: false,
    tags: '',
    exif_data: {},
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const res = await fetch('/api/albums');
    if (res.ok) {
      const data = await res.json();
      setAlbums(data);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadProgress('Extracting EXIF data...');

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Extract EXIF data
    try {
      const exifData = await exifr.parse(file, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
      });

      // Auto-fill title from filename
      const autoTitle = file.name
        .replace(/.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\bw/g, (c) => c.toUpperCase());

      setFormData((prev) => ({
        ...prev,
        title: autoTitle,
        exif_data: exifData || {},
      }));

      setUploadProgress('EXIF data extracted');
    } catch (error) {
      console.error('EXIF extraction failed:', error);
      setFormData((prev) => ({
        ...prev,
        title: file.name.replace(/.[^/.]+$/, ''),
      }));
      setUploadProgress('EXIF extraction failed, continuing...');
    }
  };

  const generateWebP = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const password = sessionStorage.getItem('admin_auth');

    try {
      // Step 1: Generate WebP thumbnail
      setUploadProgress('Generating thumbnail...');
      const webpBlob = await generateWebP(selectedFile);
      const webpFile = new File(
        [webpBlob],
        `thumb_${selectedFile.name.replace(/.[^/.]+$/, '.webp')}`,
        { type: 'image/webp' }
      );

      // Step 2: Get presigned URL for full image (R2)
      setUploadProgress('Getting upload URL for full image...');
      const r2Response = await fetch(
        `/api/upload-url?type=r2&filename=${encodeURIComponent(selectedFile.name)}`,
        { headers: { Authorization: `Bearer ${password}` } }
      );
      const { url: r2PresignedUrl, publicUrl: fullImageUrl } = await r2Response.json();

      // Step 3: Upload full image directly to R2 from browser
      setUploadProgress('Uploading full image to R2...');
      const r2Upload = await fetch(r2PresignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!r2Upload.ok) throw new Error('R2 upload failed');

      // Step 4: Upload thumbnail to Vercel Blob
      setUploadProgress('Uploading thumbnail...');
      const blobFormData = new FormData();
      blobFormData.append('file', webpFile);

      const blobResponse = await fetch(
        `/api/upload-url?type=blob&filename=${encodeURIComponent(webpFile.name)}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${password}` },
          body: blobFormData,
        }
      );
      const { url: thumbnailUrl } = await blobResponse.json();

      // Step 5: Save metadata to database
      setUploadProgress('Saving metadata...');
      const metadata = {
        title: formData.title,
        description: formData.description,
        full_url: fullImageUrl,
        thumbnail_url: thumbnailUrl,
        album_id: formData.album_id || null,
        featured: formData.featured,
        tags: formData.tags,
        exif_data: JSON.stringify(formData.exif_data),
      };

      const saveResponse = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(metadata),
      });

      if (!saveResponse.ok) throw new Error('Metadata save failed');

      // Success!
      setUploadProgress('✅ Upload complete!');
      setTimeout(() => {
        setSelectedFile(null);
        setPreview(null);
        setFormData({
          title: '',
          description: '',
          album_id: '',
          featured: false,
          tags: '',
          exif_data: {},
        });
        setUploadProgress('');
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upload Image</h1>

      <form onSubmit={handleUpload} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - File Upload & Preview */}
          <div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
              <label className="block mb-4">
                <span className="text-sm font-medium text-white/60 mb-2 block">
                  Select Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-white/90 file:cursor-pointer"
                />
              </label>

              {preview && (
                <div className="mt-4">
                  <p className="text-sm text-white/60 mb-2">Preview:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-lg border border-white/10"
                  />
                </div>
              )}
            </div>

            {/* EXIF Data Display */}
            {Object.keys(formData.exif_data).length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  EXIF Data
                </h3>
                <dl className="space-y-2 text-sm">
                  {formData.exif_data.Make && (
                    <>
                      <dt className="text-white/40">Camera</dt>
                      <dd className="mb-2">
                        {formData.exif_data.Make} {formData.exif_data.Model}
                      </dd>
                    </>
                  )}
                  {formData.exif_data.DateTimeOriginal && (
                    <>
                      <dt className="text-white/40">Date Taken</dt>
                      <dd className="mb-2">
                        {new Date(formData.exif_data.DateTimeOriginal).toLocaleString()}
                      </dd>
                    </>
                  )}
                  {formData.exif_data.FocalLength && (
                    <>
                      <dt className="text-white/40">Focal Length</dt>
                      <dd className="mb-2">{formData.exif_data.FocalLength}mm</dd>
                    </>
                  )}
                  {formData.exif_data.FNumber && (
                    <>
                      <dt className="text-white/40">Aperture</dt>
                      <dd className="mb-2">f/{formData.exif_data.FNumber}</dd>
                    </>
                  )}
                  {formData.exif_data.ISO && (
                    <>
                      <dt className="text-white/40">ISO</dt>
                      <dd className="mb-2">{formData.exif_data.ISO}</dd>
                    </>
                  )}
                  {formData.exif_data.ExposureTime && (
                    <>
                      <dt className="text-white/40">Shutter Speed</dt>
                      <dd className="mb-2">{formData.exif_data.ExposureTime}s</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Right Column - Metadata Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={uploading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={uploading}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Album
              </label>
              <select
                value={formData.album_id}
                onChange={(e) => setFormData({ ...formData, album_id: e.target.value })}
                disabled={uploading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="">No Album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="landscape, sunset, nature"
                disabled={uploading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                disabled={uploading}
                className="w-4 h-4 bg-white/5 border-white/10 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm">
                Mark as Featured
              </label>
            </div>

            {uploadProgress && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-sm">
                {uploadProgress}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}