# Companion Module Extracted

I have successfully packaged the entire React Companion module for you!

## Your Package

> [!TIP]
> Your complete source package is ready here: [Companion_Module.zip](file:///e:/claw/Companion_Module.zip)

## What's Inside?
This zip file contains three main folders:
1. `companion/`: The raw React/TypeScript source code (including `PetGalleryDialog.tsx`, `SpritePetCompanion.tsx`, etc.)
2. `petdex/`: All the `.webp` spritesheets and character definitions (`pets.json`).
3. `piko/`: All the image accessories for the Piko character.

## Integration Instructions
Since this is a React module, you cannot simply copy/paste it into a plain HTML file. You (or your web developer) will need to:

1. **Move the Code**: Unzip the folder. Place the `companion` folder into your React project's `src/features/` directory.
2. **Move the Assets**: Place the `piko` and `petdex` folders into your project's `public/` directory so the browser can serve the image assets.
3. **Resolve Dependencies**: The code relies heavily on external libraries. You will need to install these packages in your project:
   - `zustand` (for global state management)
   - `react-i18next` (for translation/localization)
   - `@radix-ui/react-dialog` (for the modal popup)
4. **Wire up the State**: The components rely on a global store (`useAppStore`). You will need to open the files and replace references to `useAppStore` and `useTaskCenterStore` with your own state logic that tracks what companion the user selected and what action they are currently performing.

If you don't have experience with React, I highly recommend handing this zip file directly to your front-end web developer. They will have all the pieces they need to rebuild the feature for you!
