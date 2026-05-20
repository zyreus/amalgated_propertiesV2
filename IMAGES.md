# Where to add pictures

You can add images in **two places**, depending on how you want to use them.

---

## 1. **`public/`** (easiest for logos, favicons, one-off images)

- **Put files here:** `c:\Projects\amalgated-properties\public\`
- **Use in code:** reference from the site root, e.g. `/logo.png` or `/images/hero.jpg`

**Example:**  
If you add `public/logo.png`, use it like this:

```jsx
<img src="/logo.png" alt="Amalgated Properties" />
```

Good for: logo, favicon, hero image, any image you refer to by a fixed path.

---

## 2. **`src/assets/`** (for images used in components, with bundling)

- **Put files here:** `c:\Projects\amalgated-properties\src\assets\`
- **Use in code:** import at the top of the file, then use the variable in `src={...}`

**Example:**  
If you add `src/assets/logo.png`:

```jsx
import logo from '../assets/logo.png';

// then in JSX:
<img src={logo} alt="Amalgated Properties" />
```

Good for: logos, icons, and images that should be hashed and cached by Vite.

---

## Where pictures appear on the site

| Place              | File to edit              | What to change |
|--------------------|---------------------------|----------------|
| **Header logo**    | `src/components/Header.jsx` | Replace the "AP" box with `<img src="/logo.png" alt="..." />` or an import from `src/assets/logo.png`. |
| **Hero section**   | `src/components/Hero.jsx` | No image in Hero right now; you can add a background or a side image and set its `src` to a path in `public/` or an import from `src/assets/`. |
| **About section**  | `src/components/About.jsx` | Add an `<img>` (e.g. team or building) using a path from `public/` or an import from `src/assets/`. |
| **Property cards** | `src/components/PropertyGrid.jsx` | Each property has an `image` field (currently Pexels URLs). You can set `image: '/properties/name.jpg'` for files in `public/properties/`, or import from `src/assets/` and use that variable. |
| **Contact / Footer** | `src/components/Contact.jsx`, `Footer.jsx` | Add an image the same way: `src="/your-file.jpg"` or `src={importedImage}`. |

---

## Quick start

1. Create the folder if needed:
   - **Option A:** `c:\Projects\amalgated-properties\public\`  
   - **Option B:** `c:\Projects\amalgated-properties\src\assets\`

2. Copy your picture into that folder (e.g. `logo.png`, `hero.jpg`).

3. In the component:
   - **From public:** `<img src="/logo.png" alt="Logo" />`
   - **From assets:**  
     `import myPic from '../assets/hero.jpg';`  
     then `<img src={myPic} alt="Hero" />`
