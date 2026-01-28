import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getUploadDir } from '@/lib/upload-dir';

interface IconSlot {
  category: string;
  filename: string;
  label: string;
  hasUpload: boolean;
}

const ICON_SLOTS: Record<string, { filename: string; label: string }[]> = {
  animals: [
    { filename: 'african_dog_nowords.png', label: 'African Dog (no words)' },
    { filename: 'african_dogs.png', label: 'African Dog (with words)' },
    { filename: 'Lion_nowords.png', label: 'Lion (no words)' },
    { filename: 'Lion.png', label: 'Lion (with words)' },
    { filename: 'Whale_nowords.png', label: 'Killer Whale (no words)' },
    { filename: 'killer_whale.png', label: 'Killer Whale (with words)' },
    { filename: 'Tiger_nowords.png', label: 'Tiger (no words)' },
    { filename: 'Tiger.png', label: 'Tiger (with words)' },
  ],
  'risk-reward': [
    { filename: 'Low Risk.png', label: 'Low Risk' },
    { filename: 'Medium Risk.png', label: 'Medium Risk' },
    { filename: 'High Risk.png', label: 'High Risk' },
    { filename: 'Low Reward.png', label: 'Low Reward' },
    { filename: 'Medium Reward.png', label: 'Medium Reward' },
    { filename: 'High Reward.png', label: 'High Reward' },
  ],
  drivers: [
    { filename: 'Boss.png', label: 'Boss' },
    { filename: 'Control.png', label: 'Control' },
    { filename: 'Passion.png', label: 'Passion' },
    { filename: 'Money.png', label: 'Money' },
    { filename: 'Solve.png', label: 'Solve' },
    { filename: 'Impact.png', label: 'Impact' },
    { filename: 'Legacy.png', label: 'Legacy' },
  ],
  aoi: [
    { filename: 'Arts.png', label: 'Arts' },
    { filename: 'Consult.png', label: 'Consulting' },
    { filename: 'Digital.png', label: 'Digital' },
    { filename: 'Educate.png', label: 'Education' },
    { filename: 'Hospitality.png', label: 'Hospitality' },
    { filename: 'Health.png', label: 'Health' },
    { filename: 'Personal.png', label: 'Personal' },
    { filename: 'Retail.png', label: 'Retail' },
    { filename: 'Social.png', label: 'Social' },
    { filename: 'Tech.png', label: 'Tech' },
  ],
  strategies: [
    { filename: 'Creator.png', label: 'Creator' },
    { filename: 'Consolidator.png', label: 'Consolidator' },
    { filename: 'Franchise.png', label: 'Franchisee' },
    { filename: 'Contract.png', label: 'Contractor' },
  ],
  logo: [
    { filename: 'ep2Logo.png', label: 'EP2 Logo' },
  ],
};

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const category = request.nextUrl.searchParams.get('category');
  const uploadDir = getUploadDir();

  const result: Record<string, IconSlot[]> = {};

  const categories = category ? [category] : Object.keys(ICON_SLOTS);

  for (const cat of categories) {
    const slots = ICON_SLOTS[cat];
    if (!slots) continue;

    result[cat] = slots.map((slot) => {
      const uploadSubdir = cat === 'logo' ? '' : cat;
      const uploadPath = path.join(uploadDir, uploadSubdir, slot.filename);
      return {
        category: cat,
        filename: slot.filename,
        label: slot.label,
        hasUpload: existsSync(uploadPath),
      };
    });
  }

  return NextResponse.json(result);
}
