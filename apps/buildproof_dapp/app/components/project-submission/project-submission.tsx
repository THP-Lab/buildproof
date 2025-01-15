import React, { useState } from 'react';
import {
  Text,
  Input,
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Icon,
  IconName,
  Textarea,
  Separator,
} from '@0xintuition/buildproof_ui';

// Predefined roles for team members
const TEAM_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Project Manager',
  'Smart Contract Developer',
  'DevOps Engineer',
] as const;

type TeamRole = typeof TEAM_ROLES[number];

interface TeamMember {
  name: string;
  role: TeamRole | '';
}

interface ProjectSubmissionForm {
  teamName: string;
  projectName: string;
  projectDescription: string;
  submissionLink: string;
  teamMembers: TeamMember[];
}

const INITIAL_FORM_STATE: ProjectSubmissionForm = {
  teamName: '',
  projectName: '',
  projectDescription: '',
  submissionLink: '',
  teamMembers: [{ name: '', role: '' }], // Start with one empty team member
};

export function ProjectSubmission() {
  const [formData, setFormData] = useState<ProjectSubmissionForm>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectSubmissionForm, string>>>({});

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectSubmissionForm, string>> = {};

    // Team name validation
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }

    // Project name validation
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    } else if (formData.projectName.length < 3 || formData.projectName.length > 20) {
      newErrors.projectName = 'Project name must be between 3 and 20 characters';
    }

    // Project description validation
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }

    // Submission link validation
    if (!formData.submissionLink.trim()) {
      newErrors.submissionLink = 'Submission link is required';
    } else if (!validateUrl(formData.submissionLink)) {
      newErrors.submissionLink = 'Please enter a valid URL';
    }

    // Team members validation
    if (formData.teamMembers.length === 0) {
      newErrors.teamMembers = 'At least one team member is required';
    } else {
      const hasEmptyFields = formData.teamMembers.some(
        member => !member.name.trim() || !member.role
      );
      if (hasEmptyFields) {
        newErrors.teamMembers = 'All team member fields must be filled';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically submit the form data to your backend
      console.log('Form submitted:', formData);
    }
  };

  const addTeamMember = () => {
    if (formData.teamMembers.length < 5) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { name: '', role: '' }],
      }));
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Text variant="h1" className="font-bold mb-8">
          Submit Your Project
        </Text>

        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-6">
            Team Information
          </Text>
          <div className="space-y-4">
            <div>
              <Text variant="body" weight="medium" className="mb-2">
                Team Name
              </Text>
              <Input
                value={formData.teamName}
                onChange={e => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                placeholder="Enter your team name"
                aria-invalid={!!errors.teamName}
                aria-errormessage={errors.teamName}
              />
              {errors.teamName && (
                <Text variant="caption" className="text-destructive mt-1">
                  {errors.teamName}
                </Text>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Text variant="body" weight="medium">
                  Team Members
                </Text>
                {formData.teamMembers.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                    type="button"
                  >
                    <Icon name={IconName.arrowRight} className="mr-1 h-4 w-4" />
                    Add Member
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Input
                      value={member.name}
                      onChange={e => updateTeamMember(index, 'name', e.target.value)}
                      placeholder="Member name"
                      className="flex-1"
                    />
                    <Select
                      value={member.role}
                      onValueChange={value => updateTeamMember(index, 'role', value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          {TEAM_ROLES.map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formData.teamMembers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember(index)}
                        type="button"
                      >
                        <Icon name={IconName.arrowLeft} className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.teamMembers && (
                <Text variant="caption" className="text-destructive mt-1">
                  {errors.teamMembers}
                </Text>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 theme-border rounded-lg p-6">
          <Text variant="h3" weight="semibold" className="mb-6">
            Project Information
          </Text>
          <div className="space-y-4">
            <div>
              <Text variant="body" weight="medium" className="mb-2">
                Project Name
              </Text>
              <Input
                value={formData.projectName}
                onChange={e => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Enter project name"
                aria-invalid={!!errors.projectName}
                aria-errormessage={errors.projectName}
              />
              {errors.projectName && (
                <Text variant="caption" className="text-destructive mt-1">
                  {errors.projectName}
                </Text>
              )}
            </div>

            <div>
              <Text variant="body" weight="medium" className="mb-2">
                Project Description
              </Text>
              <Textarea
                value={formData.projectDescription}
                onChange={e => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Describe your project..."
                className="min-h-[100px]"
                aria-invalid={!!errors.projectDescription}
                aria-errormessage={errors.projectDescription}
              />
              {errors.projectDescription && (
                <Text variant="caption" className="text-destructive mt-1">
                  {errors.projectDescription}
                </Text>
              )}
            </div>

            <div>
              <Text variant="body" weight="medium" className="mb-2">
                Submission Link
              </Text>
              <Input
                value={formData.submissionLink}
                onChange={e => setFormData(prev => ({ ...prev, submissionLink: e.target.value }))}
                placeholder="https://..."
                aria-invalid={!!errors.submissionLink}
                aria-errormessage={errors.submissionLink}
              />
              {errors.submissionLink && (
                <Text variant="caption" className="text-destructive mt-1">
                  {errors.submissionLink}
                </Text>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Submit Project
        </Button>
      </form>
    </div>
  );
} 