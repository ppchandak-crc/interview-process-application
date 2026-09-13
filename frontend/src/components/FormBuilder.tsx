import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'select' | 'file' | 'date' | 'checkbox';
export type FieldWidth = 'full' | 'half' | 'third';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // for select
  width?: FieldWidth;
  helperText?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
}

interface FormBuilderProps {
  value: FormSchema;
  onChange: (schema: FormSchema) => void;
}

const defaultSchema: FormSchema = {
  sections: [
    {
      id: 'sec-1',
      title: 'Personal Information',
      fields: [
        { id: 'first_name', type: 'text', label: 'First Name', required: true, width: 'half' },
        { id: 'last_name', type: 'text', label: 'Last Name', required: true, width: 'half' }
      ]
    }
  ]
};

const FormBuilder: React.FC<FormBuilderProps> = ({ value, onChange }) => {
  const schema = value || defaultSchema;

  const updateSchema = (newSchema: FormSchema) => {
    onChange(newSchema);
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `sec-${Date.now()}`,
      title: 'New Section',
      fields: []
    };
    updateSchema({ ...schema, sections: [...schema.sections, newSection] });
  };

  const removeSection = (sectionIndex: number) => {
    const newSections = [...schema.sections];
    newSections.splice(sectionIndex, 1);
    updateSchema({ ...schema, sections: newSections });
  };

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    const newSections = [...schema.sections];
    newSections[sectionIndex].title = title;
    updateSchema({ ...schema, sections: newSections });
  };

  const addField = (sectionIndex: number) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Question',
      required: false
    };
    const newSections = [...schema.sections];
    newSections[sectionIndex].fields.push(newField);
    updateSchema({ ...schema, sections: newSections });
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...schema.sections];
    newSections[sectionIndex].fields.splice(fieldIndex, 1);
    updateSchema({ ...schema, sections: newSections });
  };

  const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    const newSections = [...schema.sections];
    newSections[sectionIndex].fields[fieldIndex] = { ...newSections[sectionIndex].fields[fieldIndex], ...updates };
    updateSchema({ ...schema, sections: newSections });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Form Builder</h3>
        <button
          type="button"
          onClick={addSection}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Section
        </button>
      </div>

      {schema.sections.map((section, sIdx) => (
        <div key={section.id} className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
              className="text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:bg-white px-2 py-1"
            />
            <button type="button" onClick={() => removeSection(sIdx)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {section.fields.map((field, fIdx) => (
              <div key={field.id} className="bg-white border border-slate-200 rounded-md p-4 flex gap-4 items-start shadow-sm group">
                <GripVertical className="w-5 h-5 text-slate-300 mt-2 cursor-move" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-4 flex-wrap">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(sIdx, fIdx, { label: e.target.value })}
                      placeholder="Question Title"
                      className="flex-1 min-w-[200px] font-medium bg-slate-50 border border-slate-200 rounded-md px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(sIdx, fIdx, { type: e.target.value as FieldType })}
                      className="w-40 bg-white border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Paragraph</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                      <option value="file">File Upload</option>
                    </select>
                    <select
                      value={field.width || 'full'}
                      onChange={(e) => updateField(sIdx, fIdx, { width: e.target.value as FieldWidth })}
                      className="w-32 bg-white border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="full">Full Width</option>
                      <option value="half">Half Width</option>
                      <option value="third">1/3 Width</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={field.helperText || ''}
                      onChange={(e) => updateField(sIdx, fIdx, { helperText: e.target.value })}
                      placeholder="Helper text (optional)"
                      className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {field.type === 'select' && (
                    <div className="pl-2 space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Dropdown Options (comma separated)</label>
                      <input
                        type="text"
                        value={field.options?.join(', ') || ''}
                        onChange={(e) => updateField(sIdx, fIdx, { options: e.target.value.split(',').map(s => s.trimStart()) })}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full text-sm bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(sIdx, fIdx, { required: e.target.checked })}
                          className="mr-2"
                        />
                        Required
                      </label>
                      <span className="text-xs text-slate-400 font-mono">ID: {field.id}</span>
                    </div>
                    <button type="button" onClick={() => removeField(sIdx, fIdx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addField(sIdx)}
            className="mt-4 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors w-full justify-center border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </button>
        </div>
      ))}
    </div>
  );
};

export default FormBuilder;
