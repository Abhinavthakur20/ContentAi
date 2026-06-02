'use client';

import { useState } from 'react';
import GeneratorForm from '@/components/GeneratorForm';
import ResultPanel from '@/components/ResultPanel';
import type { ContentVariation, GenerateRequest, GenerateResponse } from '@/types';

const initialFormData: GenerateRequest = {
  businessType: '',
  tone: 'motivational',
  offer: '',
  platform: 'instagram',
};

export default function GeneratorExperience() {
  const [formData, setFormData] = useState<GenerateRequest>(initialFormData);
  const [customBusiness, setCustomBusiness] = useState('');
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [generationError, setGenerationError] = useState('');

  const submitForm = async () => {
    const selectedBusiness =
      formData.businessType === 'custom' ? customBusiness.trim() : formData.businessType.trim();

    if (!selectedBusiness) {
      setFieldError('Required');
      return;
    }

    setFieldError('');
    setGenerationError('');
    setIsLoading(true);

    const payload: GenerateRequest = {
      ...formData,
      businessType: selectedBusiness,
      offer: formData.offer.trim(),
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setVariations(data.variations);
    } catch (error) {
      console.error('Generation failed', error);
      setVariations([]);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid md:grid-cols-2">
      <GeneratorForm
        formData={formData}
        customBusiness={customBusiness}
        isLoading={isLoading}
        error={fieldError}
        onFormChange={setFormData}
        onCustomBusinessChange={setCustomBusiness}
        onSubmit={submitForm}
      />
      <ResultPanel
        variations={variations}
        isLoading={isLoading}
        errorMessage={generationError}
        onRegenerate={submitForm}
      />
    </section>
  );
}
