import Button from '@/components/shared/small/Button';
import CustomizableSelect from '@/components/shared/small/CustomizeableSelect';
import html2canvas from 'html2canvas-pro';
import { useCallback, useEffect, useRef, useState } from 'react';
import FontPicker from './FontPicker';
import { LoaderIcon } from 'lucide-react';

export const ColorInput = ({ label, color, setColor, setImage, image }) => {
  const colorPickerDiv = useRef(null);
  const [ssLoading, setSSLoading] = useState(false);
  const [showSSButton, setShowSSButton] = useState(false);
  const [colorPicker, setColorPicker] = useState('');
  const handleChange = useCallback(
    async e => {
      setSSLoading(true);
      const newColor = e.target.value;
      setColorPicker(newColor);
      console.log(`[ColorInput] 🎨 Color changed to:`, newColor);

      setTimeout(async () => {
        const selector =
          '#root > div:nth-child(2) > section > section > div.w-full.flex-1.items-center.justify-center > main > div > div:nth-child(1) > div > div > #screen-shot';

        console.log(`[ColorInput] 🔍 Trying to capture element:`, selector);
        const element = document.querySelector(selector);
        if (!element) {
          console.warn(`[ColorInput] ❌ Element not found`);
          return;
        }

        const previousFilter = element.style.filter;
        element.style.filter = 'none';
        element.style.colorScheme = 'light';

        console.log(`[ColorInput] ✅ Element found. Starting html2canvas...`);

        try {
          const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: null,
          });

          console.log(`[ColorInput] 📸 Screenshot captured successfully.`);

          const imageData = canvas.toDataURL('image/png');
          const fileName = `screenshot-${Date.now()}.png`;

          // ✅ Convert base64 → File
          const response = await fetch(imageData);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: 'image/png' });

          // ✅ Optional: trigger download (kept original functionality)
          const link = document.createElement('a');
          // link.download = fileName;
          link.href = imageData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log(`[ColorInput] ✅ Image downloaded successfully as "${fileName}".`);

          // ✅ Save only filename to localStorage
          try {
            localStorage.setItem('lastScreenshot', fileName);
            console.log(`[ColorInput] 💾 Stored only filename in localStorage.`);
          } catch (err) {
            console.error(`[ColorInput] ⚠️ Failed to save filename:`, err);
          }

          setImage(file); // ✅ Set actual File object
        } catch (error) {
          console.error(`[ColorInput] ❌ Error capturing screenshot:`, error);
        } finally {
          element.style.filter = previousFilter;
          if (colorPicker) setColor(colorPicker);

          setShowSSButton(false);
          setSSLoading(false);
        }
      }, 1000);
    },
    [colorPicker, setColor, setImage]
  );

  const openHandleChange = async () => {
    if (image) return;
    await handleChange({ target: { value: colorPicker } });
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (colorPickerDiv.current && !colorPickerDiv.current.contains(event.target)) {
        setShowSSButton(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex flex-col space-y-1">
      <label htmlFor={label.toLowerCase().replace(/\s/g, '-') + '-color'} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div ref={colorPickerDiv} className="flex items-center space-x-2">
        <input
          type="color"
          className="size-14 cursor-pointer appearance-none rounded-lg border-none outline-none focus:ring-0"
          value={color}
          onFocus={() => setShowSSButton(true)}
          onChange={e => {
            const newColor = e.target.value;
            setColorPicker(newColor);
            setColor(newColor);
          }}
        />
        {showSSButton && (
          <div className="flex">
            <Button
              variant="primary"
              onClick={openHandleChange}
              label={'Show Colors'}
              disabled={ssLoading}
              cnRight={'animate-spin'}
              rightIcon={ssLoading ? LoaderIcon : null}
            />
          </div>
        )}
        <div className="flex h-12 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
          {color}
        </div>
      </div>
    </div>
  );
};

const BrandElementAssignment = ({
  headerText,
  setHeaderText,
  footerText,
  setFooterText,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  accentColor,
  setAccentColor,
  textColor,
  setTextColor,
  linkColor,
  setLinkColor,
  backgroundColor,
  setBackgroundColor,
  frameColor,
  setFrameColor,
  fontFamily,
  setFontFamily,
  image,
  setImage,

  buttonTextPrimary,
  setButtonTextPrimary,
  buttonTextSecondary,
  setButtonTextSecondary,

  headerBackground,
  setHeaderBackground,
  footerBackground,
  setFooterBackground,
  headerAlignment,
  setHeaderAlignment,
}) => {
  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Assign Brand Element</h2>

      <section className="my-6 flex w-full flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Header</h3>
        <div className="flex w-full flex-wrap justify-between">
          <ColorInput
            className="min-w-[400px]"
            setImage={setImage}
            image={image}
            label="Background"
            color={headerBackground}
            setColor={setHeaderBackground}
          />
          <ColorInput
            className="min-w-[400px]"
            setImage={setImage}
            image={image}
            label="Text"
            color={headerText}
            setColor={setHeaderText}
          />
          <div className="flex max-w-[50%] flex-1">
            <CustomizableSelect
              initialValue={headerAlignment}
              options={[
                { option: 'Left', value: 'left' },
                { option: 'Center', value: 'center' },
                { option: 'Right', value: 'right' },
              ]}
              label={'Logo Alignment'}
              onSelect={value => setHeaderAlignment(value)}
              defaultText="Choose Alignment"
            />
          </div>
        </div>
      </section>
      <section className="my-6 flex w-[70%] flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Form</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ColorInput
            setImage={setImage}
            image={image}
            label="Primary Color (Buttons, Headers)"
            color={primaryColor}
            setColor={setPrimaryColor}
          />
          <ColorInput
            setImage={setImage}
            image={image}
            label="Secondary Color (Alternative Buttons)"
            color={secondaryColor}
            setColor={setSecondaryColor}
          />
          <ColorInput setImage={setImage} image={image} label="Text Color" color={textColor} setColor={setTextColor} />
          <ColorInput setImage={setImage} image={image} label="Link Color" color={linkColor} setColor={setLinkColor} />
          <ColorInput
            setImage={setImage}
            image={image}
            label="Accent Color"
            color={accentColor}
            setColor={setAccentColor}
          />
          <ColorInput
            setImage={setImage}
            image={image}
            label="Background Color"
            color={backgroundColor}
            setColor={setBackgroundColor}
          />
          <ColorInput
            setImage={setImage}
            image={image}
            label="Frame Color (Input Fields, Borders)"
            color={frameColor}
            setColor={setFrameColor}
          />
          <ColorInput
            setImage={setImage}
            image={image}
            label="Primary Button text"
            color={buttonTextPrimary}
            setColor={setButtonTextPrimary}
          />
          <ColorInput
            setImage={setImage}
            image={image}
            label="Secondary Button text"
            color={buttonTextSecondary}
            setColor={setButtonTextSecondary}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="primary-font" className="text-sm font-medium text-gray-700">
            Primary Font
          </label>

          <div className="mt-3 flex items-center space-x-2">
            <span className="rounded bg-gray-100 px-4 py-3 text-lg font-semibold">Aa</span>
            <FontPicker value={fontFamily.toLowerCase()} onChange={value => setFontFamily(value)} />
            <button
              type="button"
              className="rounded-sm border px-4 py-[13px] text-sm text-gray-700 shadow-sm"
              onClick={() => setFontFamily('Inter')}
            >
              Reset
            </button>
          </div>
        </div>
      </section>
      <section className="my-6 flex w-full flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Footer</h3>
        <div className="flex max-w-[50%] flex-wrap justify-between">
          <ColorInput
            setImage={setImage}
            image={image}
            label="Background"
            color={footerBackground}
            setColor={setFooterBackground}
          />
          <ColorInput setImage={setImage} image={image} label="Text" color={footerText} setColor={setFooterText} />
        </div>
      </section>

      {image && (
        <div className="fixed top-4 right-0 z-50 max-h-[95vh] bg-white p-4 shadow-2xl">
          {/* ❌ Close Button */}
          <button
            onClick={() => {
              setImage(null);
              localStorage.removeItem('lastScreenshot');
              console.log('🗑️ Image removed and localStorage cleared');
            }}
            className="absolute top-2 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            ×
          </button>

          {/* 🖼️ Image Preview */}
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            style={{
              width: '30vw',
              height: 'auto',
              borderRadius: 8,
              objectFit: 'contain',
              marginRight: 16,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BrandElementAssignment;
