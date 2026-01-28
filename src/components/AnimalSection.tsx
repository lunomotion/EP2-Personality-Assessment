import Image from 'next/image';
import { ANIMAL_ICONS, type AnimalType } from '@/types/report';
import { IconCard } from './IconCard';

interface AnimalSectionProps {
  animalType: AnimalType;
  personalityTitle: string;
  personalityText: string;
  traits: string[];
}

export function AnimalSection({ animalType, personalityTitle, personalityText }: AnimalSectionProps) {
  const icons = ANIMAL_ICONS[animalType];

  return (
    <section className="mb-6">
      {/* Title Banner - matches PDF gray banner with serif font */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-200 py-3 px-8 inline-block">
          <h2 className="font-serif text-2xl font-bold text-gray-900 tracking-wide">
            You are a {animalType}
          </h2>
        </div>
      </div>

      {/* Animal with Words Image - matches PDF layout */}
      <div className="flex justify-center mb-10">
        <div className="overflow-hidden rounded-lg" style={{ margin: '-10px' }}>
          <Image
            src={icons.withWords}
            alt={`${animalType} with traits`}
            width={300}
            height={280}
            className="object-contain scale-110"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Personality Description Card */}
      <div className="report-section">
        <IconCard src={icons.icon} alt={animalType} size="lg" borderColor="black" noBorder={animalType === 'African Dog'} noPadding={animalType === 'African Dog'} />
        <div className="flex-1">
          <h3 className="report-section-title">
            {animalType}: {personalityTitle}
          </h3>
          <p className="report-section-text">
            {personalityText}
          </p>
        </div>
      </div>
    </section>
  );
}
