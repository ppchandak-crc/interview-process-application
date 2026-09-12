import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, QrCode } from 'lucide-react';
import { activityApi } from '../../services/api';
import { ActivityStatusEnum } from '../../types/activity';
import { QRCodeSVG } from 'qrcode.react';
import FormBuilder from '../../components/FormBuilder';

const activitySchema = z.object({
  name: z.string().min(1, 'Activity Name is required'),
  client: z.string().min(1, 'Client is required'),
  location: z.string().min(1, 'Location is required'),
  start_date: z.string().min(1, 'Start Date is required'),
  end_date: z.string().min(1, 'End Date is required'),
  required_participants: z.coerce.number().min(1, 'Must be at least 1'),
  maximum_registrations: z.coerce.number().min(1, 'Must be at least 1'),
  minimum_age: z.coerce.number().min(1, 'Must be at least 1'),
  safety_shoes_required: z.boolean(),
  registration_opening_date: z.string().min(1, 'Opening Date is required'),
  registration_closing_date: z.string().min(1, 'Closing Date is required'),
  introductory_paragraph: z.string().optional(),
  status: z.nativeEnum(ActivityStatusEnum),
  form_schema: z.any().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

const ActivityForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isSuperAdmin = localStorage.getItem('role') === 'SUPER_ADMIN';
  
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      status: ActivityStatusEnum.DRAFT,
      safety_shoes_required: false,
    }
  });

  useEffect(() => {
    if (isEdit && id) {
      loadActivity(parseInt(id));
    }
  }, [id]);

  const loadActivity = async (activityId: number) => {
    try {
      const data = await activityApi.getById(activityId);
      reset({
        ...data,
        start_date: data.start_date,
        end_date: data.end_date,
        registration_opening_date: data.registration_opening_date,
        registration_closing_date: data.registration_closing_date,
      });
    } catch (error) {
      console.error('Failed to load activity', error);
    }
  };

  const onSubmit = async (data: ActivityFormData) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await activityApi.update(parseInt(id), data);
      } else {
        await activityApi.create(data);
      }
      navigate('/admin/activities');
    } catch (error) {
      console.error('Failed to save activity', error);
    } finally {
      setLoading(false);
    }
  };

  const registrationLink = isEdit ? `http://localhost:5173/register/${id}` : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admin/activities" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Activity' : 'Create New Activity'}</h2>
          <p className="text-slate-500">{isEdit ? 'Update activity details and configuration' : 'Configure a new activity for registration'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 space-y-6">
          <form id="activity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">General Settings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Activity Name</label>
                  <input {...register('name')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client / Unit</label>
                  <input {...register('client')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input {...register('location')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" {...register('start_date')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" {...register('end_date')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Required Participants</label>
                  <input type="number" {...register('required_participants')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.required_participants && <p className="text-red-500 text-xs mt-1">{errors.required_participants.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Registrations</label>
                  <input type="number" {...register('maximum_registrations')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.maximum_registrations && <p className="text-red-500 text-xs mt-1">{errors.maximum_registrations.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Opening Date</label>
                  <input type="date" {...register('registration_opening_date')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.registration_opening_date && <p className="text-red-500 text-xs mt-1">{errors.registration_opening_date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Closing Date</label>
                  <input type="date" {...register('registration_closing_date')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.registration_closing_date && <p className="text-red-500 text-xs mt-1">{errors.registration_closing_date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Age</label>
                  <input type="number" {...register('minimum_age')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  {errors.minimum_age && <p className="text-red-500 text-xs mt-1">{errors.minimum_age.message}</p>}
                </div>

                <div className="flex items-center mt-6">
                  <input type="checkbox" id="shoes" {...register('safety_shoes_required')} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                  <label htmlFor="shoes" className="ml-2 block text-sm text-slate-700">Safety Shoes Required</label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Introductory Paragraph</label>
                  <textarea {...register('introductory_paragraph')} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                  {errors.introductory_paragraph && <p className="text-red-500 text-xs mt-1">{errors.introductory_paragraph.message}</p>}
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {Object.values(ActivityStatusEnum).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <Controller
                  name="form_schema"
                  control={control}
                  render={({ field }) => (
                    <FormBuilder value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            )}
          </form>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center sticky top-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center"><QrCode className="w-5 h-5 mr-2"/> Registration Link</h3>
            {isEdit ? (
              <>
                <div className="bg-white p-4 border border-slate-200 rounded-xl mb-4 shadow-sm">
                  <QRCodeSVG value={registrationLink} size={150} level={"H"} />
                </div>
                <p className="text-sm text-slate-600 mb-4 break-all px-2">{registrationLink}</p>
                <div className="flex w-full space-x-2">
                  <button onClick={() => navigator.clipboard.writeText(registrationLink)} className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                    Copy Link
                  </button>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-sm py-8">Save the activity to generate a QR code and registration link.</div>
            )}
            
            <button 
              type="submit" 
              form="activity-form"
              disabled={loading}
              className="w-full mt-6 bg-[#1a2332] hover:bg-[#263347] disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors shadow-sm"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm;
