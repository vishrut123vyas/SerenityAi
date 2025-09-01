# SerenityAI Website

SerenityAI is your mental wellness companion. Assess, heal, and connect with personalized mental health support.

## Features
- Emotional assessment
- Personalized healing (sound & light therapy)
- Anonymous chat with psychologists
- Mood tracking & analytics
- Early access signup form
- Responsive, accessible, and modern UI

## Deployment

### Netlify
1. Drag and drop the `serenityai-website` folder into Netlify Drop (https://app.netlify.com/drop) or connect your GitHub repo.
2. Netlify will auto-detect and deploy your static site.

### Vercel
1. Install the [Vercel CLI](https://vercel.com/docs/cli) or use the Vercel dashboard.
2. Import your project and deploy the `serenityai-website` folder.

### GitHub Pages
1. Push your code to a GitHub repository.
2. In repo settings, set GitHub Pages source to the `serenityai-website` folder (or root if you move files).
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## Customizing the Signup Form
- The signup form uses [Formspree](https://formspree.io/) for email collection. Replace `your-form-id` in the form `action` with your Formspree project ID.
- Or, connect to your own backend for more control.

## License
MIT 