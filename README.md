# Instantly.AI Coding Assignment for AI Engineers

# Assignment:
Develop a simple web app allowing users to generate and send emails. The app should have the following features:  

## 1. Sidebar
1. The main page should have a sidebar with a list of emails (Apple Mail style)
2. When selecting an email from the sidebar, the selected email should be displayed on the right side of the screen

## 2. Sending emails
The main page should have a button to compose a new email (placed at the bottom right corner of the screen). The following fields should be present in the compose email form:
   * To
   * CC
   * BCC
   * Subject
   * Body

## 3. AI-Powered Email Drafting (LLM powered)

•	Include a small “AI ✨” button in the compose form.

•	When clicked, prompt the user (via modal/input) to describe what the email should be about (e.g., “Meeting request for Tuesday”).

•	Based on the user’s prompt, a router assistant should decide which specialized assistant should generate the email. Implement the following assistant types:

	1.	Sales Assistant – Generates sales emails, tailored to the recipient business description. (Keep the email under 40 words total. So it can be read under 10 seconds., max 7-10 words/sentence)
   
	2.	Follow-up Assistant – Specializes in generating polite follow-up emails (e.g., “just checking in”).

•	The router assistant should analyze the input and delegate the generation task to the correct assistant. 

•	Use a separate model call with a system prompt that routes based on classification logic.

•	The selected assistant should stream the generated content into both the Subject and Body fields.

•	Allow the user to edit both fields after generation.


# Notes:
1. No need to actually send the email - it's enough to save it in the database
2. Do not spend more than 1h on this assignment, just do as much as you can in that time
3. Please remove the `.next` folder before sending the task
4. Please remove the `dev.sqlite3` folder before sending the task
5. Please remove the `node_modules` folders before sending the task
6. Please remove any other ignored files before sending the task

# Structure
This is a monorepo. It has two folders:  
1. `frontend`: This is the frontend of the application. It is built using Next.js.  
2. `backend`: This is the backend of the application. It is built using Fastify.

# Setup
1. `cd frontend` - Go to the frontend folder
2. `yarn install` - Install the dependencies
3. `yarn dev` - Start the development server (http://localhost:3000)
4. `cd ../backend` - Go to the backend folder
5. `yarn install` - Install the dependencies
6. `yarn migrate` - Run the knex db migrations
7. `yarn dev` - Start the development server (http://localhost:3001)

# Design
1. [MUI](https://mui.com/) is installed and used for the design of the frontend.
