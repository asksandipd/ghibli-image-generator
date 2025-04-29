import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';    
import axios from 'axios';
import { apiConfig } from './config';
import './App.css';
import TrussAnimation from './components/TrussAnimation';
import GeometricShapes from './components/GeometricShapes';
import BouncingBalls from './components/BouncingBalls';

const SERVER_URL = 'http://localhost:3001';

// Ghibli-inspired prompt elements for random generation
const SUBJECTS = ['cat', 'spirit', 'child', 'elderly person', 'magical creature', 'forest spirit'];
const SETTINGS = ['magical forest', 'floating castle', 'seaside town', 'mountain village', 'enchanted garden'];
const MOODS = ['peaceful', 'mystical', 'nostalgic', 'adventurous', 'dreamy'];
const TIMES = ['sunset', 'sunrise', 'misty morning', 'starry night', 'golden afternoon'];
const STYLES = ['Studio Ghibli style', 'Miyazaki inspired', 'anime watercolor', 'hand-drawn animation'];

const App = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(5);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [currentCategory, setCurrentCategory] = useState('all');
  const [speed, setSpeed] = useState(0.1);
  const [theme, setTheme] = useState('light');
  const [animationType, setAnimationType] = useState('truss');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popupImage, setPopupImage] = useState<string | null>(null);

// Define types
interface ImageInfo {
  filename: string;
  url: string;
  dateCreated: string;
}
// Load gallery images on component mount
useEffect(() => {
  loadGalleryImages();
}, []);


// Make sure the loadGalleryImages function properly updates the state
const loadGalleryImages = async () => {
  try {
    setLoading(true);
    
    // Call the server endpoint to get images
    const response = await fetch(`${SERVER_URL}/api/gallery-images`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gallery images loaded:', data.images);
    
    // Make sure the images are in the correct format
    interface ServerImage {
      filename: string;
      url: string;
      dateCreated: string;
    }

    const formattedImages: ImageInfo[] = data.images.map((img: ServerImage) => ({
      filename: img.filename,
      url: `${SERVER_URL}${img.url}`,
      dateCreated: img.dateCreated
    }));
    
    // Update the gallery state
    setImages(formattedImages);
  } catch (err) {
    console.error('Error loading gallery:', err);
    setError(`Failed to load gallery images: ${(err as Error).message}`);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const [selectedApi, setSelectedApi] = useState(apiConfig[0]);

   
  //Function to generate a random Ghibli-inspired prompt
  const generateRandomPrompt = () => {
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  const setting = SETTINGS[Math.floor(Math.random() * SETTINGS.length)];
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  const time = TIMES[Math.floor(Math.random() * TIMES.length)];
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  
  return `A ${mood} scene of a ${subject} in a ${setting} during ${time}, ${style}, vibrant colors, detailed background`;
};
  const generateImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const newImages: ImageInfo[] = [];
       
    for (let i = min; i <= max; i++) {
      // Generate a new random prompt   
      const newPrompt = generateRandomPrompt();
      setPrompt(newPrompt); 
      const response = await fetch(selectedApi.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedApi.apiKey}`,
        },
        body: JSON.stringify({ 
          inputs: newPrompt,
          parameters: {
            num_inference_steps: 50,
            guidance_scale: 7.5,
          }
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      // Get the image as blob
      const imageBlob = await response.blob();
      // Save the image to Downloads/ImagesGhibli via our server
      const savedImage = await saveImageToServer(imageBlob);
      newImages.push(savedImage);
      // Update state with new images
      setImages(prev => [...newImages, ...prev]);
   }
   
    
    // Important: After generating and saving, explicitly load the gallery
    await loadGalleryImages();
  }catch (err) {
    console.error('Error generating images:', err);
    setError(`Failed to generate images: ${(err as Error).message}`);
  } finally {
    setLoading(false);
  }
};

  const addCategory = (category: string) => {
    setCategories((prev: Record<string, string[]>) => ({ ...prev, [category]: [] }));
  };

  const tagImageToCategory = (image: string, category: string) => {
    setCategories((prev: Record<string, string[]>) => ({
      ...prev,
      [category]: [...(prev[category] || []), image],
    }));
  };
 // Save image to server
 const saveImageToServer = async (imageBlob: Blob): Promise<ImageInfo> => {
  const formData = new FormData();
  formData.append('image', imageBlob, `image_${uuidv4()}.png`);
  
  const response = await axios.post(`${SERVER_URL}/api/save-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (!response.data.success) {
    throw new Error('Failed to save image to server');
  }
  
  return {
    filename: response.data.filename,
    url: `${SERVER_URL}${response.data.path}`,
    dateCreated: new Date().toISOString(),
  };
};
  const filteredImages = currentCategory === 'all' ? images : categories[currentCategory] || [];

  const handleImageClick = (image: string) => {
    setPopupImage(image);
    const gallery = document.querySelector('.gallery-images');
    if (gallery) {
      (gallery as HTMLElement).style.animationPlayState = 'paused';
    }
  };

  const closePopup = () => {
    setPopupImage(null);
    const gallery = document.querySelector('.gallery-images');
    if (gallery) {
      (gallery as HTMLElement).style.animationPlayState = 'running';
    }
  };

  return (
    <div className="App">
      <GeometricShapes />
      <div className="theme-toggle">
        <label htmlFor="themeSelector">Theme:</label>
        <select
          id="themeSelector"
          value={theme}
          onChange={handleThemeChange}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
      <div className="speed-control">
        <label htmlFor="speedSlider">Speed:</label>
        <input
          id="speedSlider"
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
        <select
          value={animationType}
          onChange={(e) => setAnimationType(e.target.value)}
        >
          <option value="truss">Truss Animation</option>
          <option value="bouncing">Bouncing Balls</option>
        </select>
      </div>
      {animationType === 'truss' ? (
        <TrussAnimation speed={speed} />
      ) : (
        <BouncingBalls speed={speed} />
      )}
      <h1 style={{ fontSize: '100px' }}>*-* Ghibli nost-AI-g-IA *-*</h1>
      <section className="controls-section">
        <div className="controls">
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            placeholder="Min"
          />
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            placeholder="Max"
          />
          <select onChange={(e) => setSelectedApi(apiConfig[Number(e.target.value)])}>
            {apiConfig.map((api, index) => (
              <option key={index} value={index}>{api.name}</option>
            ))}
          </select>
          <button disabled={loading} className="generate-btn" onClick={generateImages}> {loading ? 'Generating...' : 'Generate Random Ghibli Image'}</button>
          <button 
            onClick={loadGalleryImages}
            disabled={loading}
            className="gallery-btn"
          >
          Refresh Gallery
          </button>
          <input
            type="text"
            placeholder="Add Category"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCategory((e.target as HTMLInputElement).value);
            }}
          />
          <select onChange={(e) => setCurrentCategory(e.target.value)}>
            <option value="all">All</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      
      </section>
      <h2>Generated Images</h2>
      <div className="prompt-display">
        <p>{prompt}</p>
        <button onClick={() => navigator.clipboard.writeText(prompt)}>Copy Prompt</button>
        <button onClick={() => navigator.clipboard.writeText(images.join(', '))}>Copy Image URLs</button>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(categories))}>Copy Categories</button>
      </div>
      <div className="image-controls">  
        <button onClick={() => setImages([])}>Clear Images</button>
        <button onClick={() => setCategories({})}>Clear Categories</button>
        <button onClick={() => setCurrentCategory('all')}>Show All Images</button>
        <button onClick={() => setCurrentCategory('')}>Hide Images</button>
        <button onClick={() => setCurrentCategory('random')}>Show Random Images</button>
        <button onClick={() => setCurrentCategory('tagged')}>Show Tagged Images</button>
        <button onClick={() => setCurrentCategory('untagged')}>Show Untagged Images</button>
        <button onClick={() => setCurrentCategory('favorite')}>Show Favorite Images</button>
        <button onClick={() => setCurrentCategory('recent')}>Show Recent Images</button>
        <button onClick={() => setCurrentCategory('popular')}>Show Popular Images</button>
        <button onClick={() => setCurrentCategory('trending')}>Show Trending Images</button>
        <button onClick={() => setCurrentCategory('all')}>Show All Images</button>
      </div>
      <div>
      {prompt && (
        <div className="prompt-container">
          <h3>Generated Prompt:</h3>
          <p>{prompt}</p>
        </div>
      )}
      {loading && <div className="loading">Creating magic...</div>}

      {error && <div className="error">{error}</div>}
      </div>  
      <div className="gallery-header">
        <h3>Gallery ({images.length} images)</h3>
        <div className="gallery-images">
          {images.map((image, index) => (
            <div key={image.filename} className="image-card">
              <img
                key={index}
                src={image.url}
                alt={`Generated ${index}`}
                onClick={() => handleImageClick(image.url)}
              />
            </div>
          ))}
        </div>
      </div>
      {popupImage && (
        <div className="overlay" onClick={closePopup}>
          <div className="popup">
            <img src={popupImage} alt="Popup" />
          </div>
        </div>
      )}
      <div className="gallery-footer">
        <p>Powered by Sandipz Ghibli Studio</p>   
      </div>
    </div>
  );
};

export default App;


