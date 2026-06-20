# MoneyTalk 💸

MoneyTalk is a Gen-Z focused personal finance awareness platform that helps users rethink spending decisions by framing purchases as opportunity costs rather than simple transactions.

Instead of asking "Can I afford this?", MoneyTalk encourages users to ask:

* How many work hours is this worth?
* How much could I save instead?
* Is this a need or a want?
* Am I making an impulse purchase?

The goal is to improve financial awareness through simple, relatable, and judgment-free insights.

---

# Live Demo

Website: [https://moneytalk-vibecheck.lovable.app/]

Chrome Extension: Available through the website download section.

---

# Problem Statement

Young adults frequently make impulse purchases without understanding the long-term impact on their finances.

Traditional budgeting tools often:

* Feel complex and overwhelming
* Focus heavily on spreadsheets and manual tracking
* Lack behavioral awareness mechanisms
* Do not resonate with Gen-Z users

MoneyTalk addresses these issues by making spending awareness simple, visual, and engaging.

---

# Solution

MoneyTalk transforms spending data into meaningful insights.

Users can:

* Log purchases
* Categorize spending
* Track needs vs wants
* View weekly spending trends
* Monitor awareness scores
* Identify impulse-spending patterns
* Download and use a supporting Chrome extension

The platform focuses on behavior change rather than strict budgeting.

---

# Key Features

## Purchase Tracking

Users can record purchases and monitor spending activity.

## Spending Awareness Score

Generates an awareness score based on spending behavior and purchase decisions.

## Needs vs Wants Analysis

Visual breakdown of essential and non-essential spending.

## Weekly Spending Analytics

Interactive charts showing spending trends over time.

## Impulse Spending Detection

Highlights categories where users frequently make impulsive purchases.

## Chrome Extension Support

Companion browser extension available for download directly from the website.

## Dark Mode Support

Built-in theme switching for improved accessibility and user preference.

---

# System Architecture

## Frontend

* React
* TypeScript
* TanStack Router
* TanStack Query
* Tailwind CSS
* Lucide Icons

## State Management

Custom centralized state management using the MoneyTalk store.

Responsibilities:

* User profile management
* Purchase tracking
* Theme management
* Statistics computation

## Data Flow

User Input
↓
Store Management
↓
Statistics Engine
↓
Visualization Components
↓
Dashboard UI

---

# Project Structure

src/

├── routes/

│ ├── __root.tsx

│ └── index.tsx

│

├── components/

│ ├── moneytalk/

│ │ ├── StatCard

│ │ ├── WeeklyChart

│ │ ├── NeedsWantsDonut

│ │ ├── RecentReceipts

│ │ ├── ExtensionCard

│ │ └── LogPurchaseDialog

│

├── lib/

│ ├── store.ts

│ ├── money.ts

│ └── lovable-error-reporting.ts

│

└── styles.css

public/

└── moneytalk-extension.zip

---

# Architecture Overview

## Routing Layer

Managed using TanStack Router.

Responsibilities:

* Route definitions
* SEO metadata
* Error boundaries
* Not Found handling

## Business Logic Layer

Located primarily inside:

lib/store.ts

Responsibilities:

* Purchase management
* User preferences
* Statistical calculations
* Awareness score generation

## Presentation Layer

Reusable UI components display:

* Financial statistics
* Spending charts
* Purchase history
* Insights

---

# Technical Challenges

## User Engagement

Challenge:

Traditional finance applications often feel boring and intimidating.

Solution:

* Conversational language
* Gen-Z friendly design
* Lightweight onboarding
* Gamified awareness score

---

## Spending Visualization

Challenge:

Raw transaction lists do not provide meaningful insight.

Solution:

* Weekly analytics
* Category breakdowns
* Needs vs wants visualization

---

## State Consistency

Challenge:

Keeping dashboard metrics synchronized with user actions.

Solution:

Centralized state management and derived statistics computation.

---

## Browser Extension Distribution

Challenge:

Providing easy installation without Chrome Web Store publication.

Solution:

Distribute a packaged extension ZIP through the application.

---

# Security Considerations

Current implementation:

* No sensitive financial credentials stored
* No banking integration
* No payment processing
* Client-side data management

Future improvements:

* Authentication
* Secure cloud storage
* End-to-end encryption
* User account synchronization

---

# Future Enhancements

* AI-powered spending recommendations
* Goal-based savings tracking
* Personalized financial coaching
* Expense categorization using AI
* Cloud synchronization
* Mobile application
* Chrome Web Store publication
* Financial habit streaks
* Community challenges

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd money-talk-main
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

---

# Deployment

The application is deployed using Lovable.

Deployment steps:

1. Push changes to GitHub
2. Sync project with Lovable
3. Click Publish
4. Access the generated deployment URL

---

# Authors

Developed as part of a financial awareness initiative focused on helping users make smarter spending decisions.

---

# License

This project is intended for educational and demonstration purposes.
