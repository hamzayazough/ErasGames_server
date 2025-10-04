import OutfitEraForm from './OutfitEraForm';

interface OutfitEraQuestionFormWrapperProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function OutfitEraQuestionFormWrapper({ onSubmit, isSubmitting }: OutfitEraQuestionFormWrapperProps) {
  return (
    <OutfitEraForm
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}