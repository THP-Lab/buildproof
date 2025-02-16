import { useState, useEffect } from 'react';
import { Icon, Input, IdentityTag, IdentityTagSize, Button } from '@0xintuition/buildproof_ui';

interface SearchBarProps {
  onSearch: (search: {
    subject: string | null;
    predicate: string | null;
    object: string | null;
  }) => void;
  initialValues?: {
    subject: string | null;
    predicate: string | null;
    object: string | null;
  };
}

const ClaimInput = ({ 
  value, 
  onChange, 
  placeholder,
  onKeyDown
}: { 
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => {
  return (
    <IdentityTag
      variant="non-user"
      size={IdentityTagSize.default}
      className="bg-[#1A1A1A] rounded-md"
    >
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder || '?'}
        className="bg-transparent border-none text-inherit placeholder-gray-500 w-full p-0 focus:ring-0"
      />
    </IdentityTag>
  );
};

export const SearchBar = ({ onSearch, initialValues }: SearchBarProps) => {
  const [selectedValues, setSelectedValues] = useState<{
    subject: string | null;
    predicate: string | null;
    object: string | null;
  }>({
    subject: null,
    predicate: null,
    object: null,
  });

  const [inputValues, setInputValues] = useState<{
    subject: string | null;
    predicate: string | null;
    object: string | null;
  }>(initialValues || {
    subject: null,
    predicate: null,
    object: null,
  });

  useEffect(() => {
    if (initialValues) {
      setSelectedValues(initialValues);
      setInputValues(initialValues);
    }
  }, [initialValues]);

  const handleValueChange = (field: 'subject' | 'predicate' | 'object', value: string) => {
    setInputValues(prev => ({
      ...prev,
      [field]: value || null
    }));
  };

  const handleSearch = () => {
    onSearch(inputValues);
    setSelectedValues(inputValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleReset = () => {
    const resetValues = {
      subject: null,
      predicate: null,
      object: null,
    };
    setSelectedValues(resetValues);
    setInputValues(resetValues);
    onSearch(resetValues);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <ClaimInput
            value={inputValues.subject}
            onChange={(value) => handleValueChange('subject', value)}
            onKeyDown={handleKeyDown}
            placeholder="Subject?"
          />
          <ClaimInput
            value={inputValues.predicate}
            onChange={(value) => handleValueChange('predicate', value)}
            onKeyDown={handleKeyDown}
            placeholder="Predicate?"
          />
          <ClaimInput
            value={inputValues.object}
            onChange={(value) => handleValueChange('object', value)}
            onKeyDown={handleKeyDown}
            placeholder="Object?"
          />
        </div>
        {(selectedValues.subject || selectedValues.predicate || selectedValues.object) && (
          <button
            onClick={handleReset}
            className="p-1 hover:bg-secondary/10 rounded-full"
          >
            <Icon name="x" className="w-4 h-4 text-secondary/50" />
          </button>
        )}
      </div>
      <div className="flex w-full">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSearch}
          className="w-full"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};