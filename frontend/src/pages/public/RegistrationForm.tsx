import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { activityApi } from '../../services/api';
import type { Activity } from '../../types/activity';
import type { FormSchema } from '../../components/FormBuilder';
import { Ban, CheckCircle2, Building2, MapPin, AlertTriangle, Loader2 } from 'lucide-react';

const RegistrationForm = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  const dobValue = watch('dob');

  useEffect(() => {
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0) {
        setValue('age', age.toString());
      }
    }
  }, [dobValue, setValue]);

  useEffect(() => {
    if (activityId) {
      loadActivity(parseInt(activityId));
    }
  }, [activityId]);

  const loadActivity = async (id: number) => {
    try {
      const data = await activityApi.getById(id);
      setActivity(data);
    } catch (error) {
      console.error('Failed to load activity', error);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Record<string, any>) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('activity_id', activityId || '');
      
      // Loop through data and append
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof FileList) {
          if (value.length > 0) {
            formData.append(key, value[0]);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      }

      const response = await fetch('http://localhost:8000/participants/register', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setRegistrationId(result.registration_id);
        setSubmitSuccess(true);
      } else {
        const err = await response.json();
        alert(err.detail || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission failed', error);
      alert('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading form...</p>
          </div>
        </div>
      );
    }

    if (!activity || activity.status === 'Registration Closed' || activity.status === 'Draft') {
      return (
        <div className="flex-1 flex items-center justify-center px-4 mt-20">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Registration Closed</h2>
            <p className="text-slate-600">Registration for this activity is currently closed or does not exist.</p>
          </div>
        </div>
      );
    }

    if (submitSuccess) {
      return (
        <div className="flex-1 flex items-center justify-center px-4 mt-20">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
            <p className="text-slate-600 mb-6">Your application has been received.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Your Registration ID</p>
              <p className="text-xl font-mono font-bold text-indigo-700">{registrationId}</p>
            </div>
            <p className="text-sm text-slate-500">Please take a screenshot of this page for your records.</p>
          </div>
        </div>
      );
    }

    const schema = (activity as any).form_schema as FormSchema;

    return (
      <div className="max-w-3xl mx-auto px-4 mt-8 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-[#1a2332] mb-6">{activity.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-700 mb-6 font-medium">
              <div>
                <p className="text-slate-500 mb-0.5 flex items-center"><Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Client / Industrial Unit:</p>
                <p className="pl-5">{activity.client}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Location:</p>
                <p className="pl-5">{activity.location}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Activity Period:</p>
                <p>{new Date(activity.start_date).toLocaleDateString()} to {new Date(activity.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Registration Status:</p>
                <p>{activity.status}</p>
              </div>
            </div>
            
            {activity.introductory_paragraph && (
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{activity.introductory_paragraph}</p>
            )}
            
            
            {activity.safety_shoes_required && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Information:</strong> Minimum age to participate is {activity.minimum_age} years. Safety shoes are MANDATORY for this activity.
                </div>
              </div>
            )}
          </div>
        </div>

        {!schema || !schema.sections || schema.sections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            This activity does not have a form configured yet.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {schema.sections.map((section, sIdx) => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <span className="w-7 h-7 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center mr-3 text-sm font-semibold border border-indigo-100">{sIdx + 1}</span>
                  {section.title}
                </h2>
                
                <div className="grid grid-cols-12 gap-6">
                  {section.fields.map((field) => {
                    const colSpan = field.width === 'half' ? 'col-span-12 md:col-span-6' : 
                                    field.width === 'third' ? 'col-span-12 md:col-span-4' : 
                                    'col-span-12';
                    return (
                    <div key={field.id} className={colSpan}>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'textarea' ? (
                        <textarea
                          {...register(field.id, { required: field.required ? 'This field is required' : false })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          {...register(field.id, { required: field.required ? 'This field is required' : false })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                        >
                          <option value="">Select</option>
                          {field.options?.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-start space-x-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            {...register(field.id, { required: field.required ? 'This field is required' : false })}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="leading-tight text-slate-600 font-medium">Yes</span>
                        </label>
                      ) : field.type === 'file' ? (
                        <div className="mt-1">
                          <input
                            type="file"
                            {...register(field.id, { required: field.required ? 'File is required' : false })}
                            className="block w-full text-sm text-slate-600 border border-slate-300 rounded-md bg-white focus:outline-none
                            file:mr-4 file:py-1.5 file:px-4 file:border-0 file:border-r file:border-slate-300 file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-colors"
                          />
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          {...register(field.id, { required: field.required ? 'This field is required' : false })}
                          readOnly={field.id === 'age'}
                          className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${
                            field.id === 'age' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'
                          }`}
                        />
                      )}
                      {field.helperText && (
                        <p className="text-xs text-slate-400 mt-2">{field.helperText}</p>
                      )}
                      {errors[field.id] && (
                        <p className="text-red-500 text-xs mt-1">{(errors[field.id] as any).message}</p>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            ))}

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 md:p-8 text-center mt-8">
              <h3 className="font-bold text-indigo-900 mb-2">Ready to submit?</h3>
              <p className="text-indigo-700 text-sm mb-6">Please ensure all information provided is accurate and correct.</p>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full md:w-auto md:px-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-bold text-lg shadow-sm transition-colors mx-auto block"
              >
                {submitting ? 'Submitting Registration...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <div className="bg-[#1a2332] text-white py-3 px-6 flex items-center justify-between shrink-0">
        <span className="text-sm font-medium tracking-wide">Participant Registration System</span>
        <a href="/login" className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-md transition-colors font-medium">
          Login
        </a>
      </div>
      {renderContent()}
    </div>
  );
};

export default RegistrationForm;
