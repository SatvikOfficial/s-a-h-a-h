'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Camera, Loader2 } from 'lucide-react'
import { strings } from '@/lib/strings'
import type { Language, Member, Report } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface ReportFormProps {
  language: Language
  member: Member
  onSuccess: (report: Report) => void
  onCancel: () => void
}

type Step = 'form' | 'review'

export function ReportForm({ language, member, onSuccess, onCancel }: ReportFormProps) {
  const [step, setStep] = useState<Step>('form')
  const [incidentType, setIncidentType] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('12:00')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const t = strings[language].reporting

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!incidentType) newErrors.incidentType = t.errors.selectIncident
    if (!location.trim()) newErrors.location = t.errors.required
    if (!description.trim()) newErrors.description = t.errors.required
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (photos.length >= 2) {
      setErrors({ photos: t.errors.maxPhotos })
      return
    }

    const file = e.target.files?.[0]
    if (file) {
      setUploadingPhoto(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${member.id}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('report-photos')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        setErrors({ photos: language === 'hi' ? 'फ़ोटो अपलोड करने में त्रुटि' : 'Error uploading photo' })
      } else {
        const { data: urlData } = supabase.storage.from('report-photos').getPublicUrl(fileName)
        setPhotos([...photos, urlData.publicUrl])
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.photos
          return newErrors
        })
      }
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handlePickLocation = () => {
    // In production, this would open a map picker
    // For now, using geolocation as fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`)
        },
        () => {
          setErrors({ location: language === 'hi' ? 'स्थान प्राप्त नहीं कर सकते' : 'Could not get location' })
        },
      )
    }
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setStep('review')
    }
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: insertedRow, error: dbError } = await supabase
      .from('reports')
      .insert({
        member_id: member.id,
        reporter_name: `${member.firstName} ${member.lastName}`,
        incident_type: incidentType,
        location,
        latitude,
        longitude,
        date,
        time,
        description,
        photos,
        status: 'new',
      })
      .select()
      .single()

    setSubmitting(false)

    if (dbError) {
      console.error('Report insert error:', dbError)
      setErrors({
        form:
          language === 'hi'
            ? 'रिपोर्ट जमा करने में त्रुटि हुई। पुनः प्रयास करें।'
            : 'Error submitting report. Please try again.',
      })
      return
    }

    const report: Report = {
      id: insertedRow.id,
      memberId: member.id,
      reporterName: insertedRow.reporter_name,
      incidentType: insertedRow.incident_type as any,
      location: insertedRow.location,
      latitude: insertedRow.latitude,
      longitude: insertedRow.longitude,
      date: insertedRow.date,
      time: insertedRow.time,
      description: insertedRow.description,
      photos: insertedRow.photos ?? [],
      status: 'new',
      createdAt: new Date(insertedRow.created_at),
      updatedAt: new Date(insertedRow.updated_at),
    }

    onSuccess(report)
  }

  if (step === 'form') {
    return (
      <form onSubmit={handleSubmitForm} className="space-y-6">
        <h3 className="font-serif text-2xl font-normal text-primary">{t.reportForm.heading}</h3>

        {/* Member info */}
        <div className="rounded-md bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm font-medium text-foreground/90">{t.reportForm.memberInfo}</p>
          <p className="mt-2 font-serif text-lg text-primary">
            {member.firstName} {member.lastName}
          </p>
          <p className="text-sm text-foreground/70">{member.phoneNumber}</p>
        </div>

        {/* Incident details */}
        <div>
          <h4 className="font-serif text-lg font-normal text-primary mb-4">{t.reportForm.incidentDetails}</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">
                {t.reportForm.basis}
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
              >
                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                <option value="suspicious">{t.reportForm.basisOptions.suspicious}</option>
                <option value="disturbance">{t.reportForm.basisOptions.disturbance}</option>
                <option value="vandalism">{t.reportForm.basisOptions.vandalism}</option>
                <option value="other">{t.reportForm.basisOptions.other}</option>
              </select>
              {errors.incidentType && <p className="mt-1 text-sm text-red-600">{errors.incidentType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">
                {t.reportForm.location}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
                  placeholder={language === 'hi' ? 'स्थान दर्ज करें' : 'Enter location'}
                />
                <button
                  type="button"
                  onClick={handlePickLocation}
                  className="rounded-md border border-primary/30 px-3 py-2 text-primary transition-colors hover:bg-secondary flex items-center gap-2"
                >
                  <MapPin className="size-4" />
                  <span className="hidden sm:inline text-sm">{t.reportForm.pickLocation}</span>
                </button>
              </div>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">
                  {t.reportForm.date}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">
                  {t.reportForm.time}
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">
                {t.reportForm.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
                placeholder={language === 'hi' ? 'विस्तार से बताएं' : 'Describe in detail'}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                {t.reportForm.photos}
              </label>
              <div className="flex gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative size-20 rounded-md border border-gold/30 overflow-hidden">
                    <img src={photo} alt={`Photo ${idx + 1}`} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 2 && (
                  <label className={`flex size-20 items-center justify-center rounded-md border border-dashed border-gold/50 bg-primary/5 cursor-pointer transition-colors hover:bg-primary/10 ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingPhoto ? (
                      <Loader2 className="size-6 text-primary/60 animate-spin" />
                    ) : (
                      <Camera className="size-6 text-primary/60" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddPhoto}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-primary/30 px-4 py-2 font-serif text-foreground transition-colors hover:bg-secondary"
          >
            {t.buttons.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90"
          >
            {t.reportForm.review}
            <ChevronRight className="size-4" />
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmitReport} className="space-y-6">
      <h3 className="font-serif text-2xl font-normal text-primary">{t.reportForm.review}</h3>

      {/* Review content */}
      <div className="space-y-6">
        <div>
          <h4 className="font-serif text-lg font-normal text-primary mb-3">{t.reportForm.memberInfo}</h4>
          <div className="rounded-md bg-primary/5 p-4 space-y-2">
            <p>
              <span className="text-foreground/70">{language === 'hi' ? 'नाम: ' : 'Name: '}</span>
              <span className="font-medium text-primary">
                {member.firstName} {member.lastName}
              </span>
            </p>
            <p>
              <span className="text-foreground/70">{language === 'hi' ? 'ईमेल: ' : 'Email: '}</span>
              <span className="font-medium text-primary">{member.email ?? member.phoneNumber}</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg font-normal text-primary mb-3">{t.reportForm.incidentDetails}</h4>
          <div className="rounded-md bg-primary/5 p-4 space-y-3">
            <p>
              <span className="text-foreground/70">{t.reportForm.basis}: </span>
              <span className="font-medium text-primary">{incidentType}</span>
            </p>
            <p>
              <span className="text-foreground/70">{t.reportForm.location}: </span>
              <span className="font-medium text-primary">{location}</span>
            </p>
            <p>
              <span className="text-foreground/70">{t.reportForm.date}: </span>
              <span className="font-medium text-primary">{date}</span>
            </p>
            <p>
              <span className="text-foreground/70">{t.reportForm.time}: </span>
              <span className="font-medium text-primary">{time}</span>
            </p>
            <div>
              <p className="text-foreground/70 mb-2">{t.reportForm.description}:</p>
              <p className="font-medium text-primary whitespace-pre-wrap bg-background rounded p-3">
                {description}
              </p>
            </div>
            {photos.length > 0 && (
              <div>
                <p className="text-foreground/70 mb-2">{t.reportForm.photos}:</p>
                <div className="flex gap-3">
                  {photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="size-24 rounded-md object-cover border border-gold/30"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {errors.form && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => setStep('form')}
          className="flex-1 flex items-center justify-center gap-2 rounded-md border border-primary/30 px-4 py-2 font-serif text-foreground transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="size-4" />
          {t.buttons.edit}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {language === 'hi' ? 'जमा हो रहा है…' : 'Submitting…'}
            </>
          ) : (
            t.reportForm.submitReport
          )}
        </button>
      </div>
    </form>
  )
}
