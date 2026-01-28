// Mock data for development - matches PDF example
import type { ReportData } from '@/types/report';

export const mockReportData: ReportData = {
  name: 'John',
  email: 'john@example.com',
  reportDate: new Date().toLocaleDateString(),

  // African Dog personality from PDF
  animalType: 'African Dog',
  personalityTitle: 'The Steady Strategist',
  personalityText: 'Collaborative, consistent, and dependable, the African Dog thrives in teamwork and structured environments. They prefer steady growth over risky leaps, building trust-based ventures that endure through integrity and discipline.',
  traits: ['calculated', 'control', 'steady', 'shared'],

  // Low Risk
  riskLevel: 'Low',
  riskScore: 15,
  riskCategory: 'Low Risk',
  riskText: 'A low level of risk appetite reflects a preference for stability, predictability, and security. Individuals with this mindset make decisions carefully, prioritizing preparation and consistency over rapid change. They excel at building steady, reliable businesses where planning and control minimize uncertainty.',

  // Low Reward
  rewardLevel: 'Low',
  rewardScore: 18,
  rewardCategory: 'Low Reward',
  rewardText: 'A low level of reward drive reflects a preference for shared success and collective achievement over personal gain. Individuals with this mindset are motivated by teamwork, collaboration, and contributing to a group\'s long-term stability. They find fulfillment in seeing others grow and succeed alongside them, valuing community wins over individual recognition.',

  // Impact driver from PDF
  driverKey: 'Impact',
  driverTitle: 'Have a Positive Social Impact',
  driverDescription: 'You are driven by the desire to create change and help people, communities, or causes. You want your business to line up with your values and make a meaningful difference.',
  driverQuestions: [
    'Which issue areas matter most to you, such as environment, youth, justice, health, or community development, and what types of businesses already exist in those spaces?',
    'Does your impact vision fit better with a social enterprise, a mission-driven service (like coaching or education), or an advocacy-focused venture (events, media, campaigns)?',
    'Which kinds of customers or communities do you feel most called to serve, and what kinds of services or products could genuinely help them?'
  ],

  // Consulting AOI from PDF
  aoi1Key: 'Consulting',
  aoi1Title: 'Consulting',
  aoi1Description: 'You like solving problems, offering expert advice, and helping others make better decisions. You thrive in roles where your knowledge, experience, and strategic thinking drive results.',
  aoi1Businesses: [
    'Business strategy consulting',
    'Accounting or bookkeeping firm',
    'Legal or compliance consulting',
    'HR or people operations consulting',
    'Marketing or brand consulting',
    'Financial planning or wealth advisory',
    'Career or executive coaching',
    'Nonprofit or social impact consulting',
    'Operations or process improvement consulting',
    'IT or digital transformation consulting'
  ],

  // Secondary AOI
  aoi2Key: 'Digital',
  aoi2Title: 'Digital Services',
  aoi2Description: 'You enjoy working online, creating digital assets, and providing services that help others show up better on the internet. You thrive in remote-friendly, scalable businesses.',
  aoi2Businesses: [
    'Website design and development',
    'Graphic design studio',
    'Social media management agency',
    'Copywriting or content writing services',
    'SEO or digital marketing agency',
    'Video editing or animation services',
    'UX/UI design consultancy',
    'Email marketing or funnel-building services',
    'Virtual assistant or online operations support',
    'Online course or digital product creation services'
  ],

  // Franchisee strategy from PDF
  strategyKey: 'Franchisee',
  strategyTitle: 'Franchise',
  strategyDescription: 'You are attracted to a clear system and recognizable brand rather than building everything from scratch. Buying into a franchise lets you follow a proven playbook with support, while trading some creative freedom for structure and guidance.',
  strategyActions: [
    'Make a shortlist of franchise industries that interest you, such as food, fitness, or services, and note what appeals to you about each.',
    'Compare a few franchise options by looking at startup costs, support offered, and day-to-day responsibilities to see what fits your reality.',
    'Arrange a conversation with a current franchise owner to ask about their experience, including what has been easier and harder than expected.'
  ],
};

// Function to fetch report data by email
// First tries the API (which checks in-memory store), then falls back to mock data
export async function getReportByEmail(email: string): Promise<ReportData | null> {
  if (!email) return null;

  try {
    // Try to fetch from API first (checks webhook store)
    const response = await fetch(`/api/webhook/typeform?email=${encodeURIComponent(email)}`);

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('API fetch failed, using mock data');
  }

  // Simulate network delay for mock data
  await new Promise(resolve => setTimeout(resolve, 800));

  // Fall back to mock data in development
  return {
    ...mockReportData,
    email,
    name: email.split('@')[0],
  };
}
