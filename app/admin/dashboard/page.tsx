'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, RefreshCw } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { supabase } from '@/lib/supabase'

type ReportStatus = 'new' | 'reviewing' | 'acknowledged' | 'resolved'

interface Report {
  id: string
  reporter_name: string
  incident_type: string
  location: string
  date: string
  time: string
  status: ReportStatus
  description: string
  photos: string[]
  created_at: string
  member_id: string | null
  members?: { member_code: string; email: string } | null
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('reports')
      .select('*, members(member_code, email)')
      .order('created_at', { ascending: false })

    setLoading(false)
    if (fetchError) {
      console.error('Fetch reports error:', fetchError)
      setError('रिपोर्ट लोड करने में त्रुटि हुई।')
      return
    }
    setReports((data as Report[]) ?? [])
    // Refresh selected report if it's in the list
    if (selectedReport) {
      const updated = (data as Report[])?.find((r) => r.id === selectedReport.id)
      if (updated) setSelectedReport(updated)
    }
  }, [selectedReport])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Verify admin role
        const { data: profile } = await supabase
          .from('members')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        if (profile && profile.role === 'admin') {
          setIsAuthenticated(true)
          fetchReports()
        }
      }
      setCheckingAuth(false)
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime subscription
  useEffect(() => {
    if (!isAuthenticated) return

    const channel = supabase
      .channel('reports-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          console.log('Realtime change received!', payload)
          // Simply refetch the reports to ensure we have the joined member data
          fetchReports()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthenticated, fetchReports])

  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingStatus(reportId)
    const { error: updateError } = await supabase
      .from('reports')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', reportId)

    if (updateError) {
      console.error('Update status error:', updateError)
      setUpdatingStatus(null)
      return
    }

    // Update local state optimistically
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    )
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => prev ? { ...prev, status: newStatus } : prev)
    }
    setUpdatingStatus(null)
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-green-100 text-green-800',
      resolved: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      new: 'नई',
      reviewing: 'समीक्षा में',
      acknowledged: 'स्वीकृत',
      resolved: 'समाधान',
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.new}`}>
        {labels[status] || status}
      </span>
    )
  }

  const nextStatusMap: Record<ReportStatus, { label: string; next: ReportStatus }> = {
    new: { label: 'समीक्षा शुरू करें', next: 'reviewing' },
    reviewing: { label: 'स्वीकृत करें', next: 'acknowledged' },
    acknowledged: { label: 'समाधान करें', next: 'resolved' },
    resolved: { label: 'फिर से खोलें', next: 'new' },
  }

  const statCounts = {
    total: reports.length,
    new: reports.filter((r) => r.status === 'new').length,
    reviewing: reports.filter((r) => r.status === 'reviewing').length,
    acknowledged: reports.filter((r) => r.status === 'acknowledged').length,
  }

  if (checkingAuth) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary/60" />
        </main>
        <SiteFooter />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture flex items-center justify-center">
          <div className="text-center rounded-lg border border-gold/30 bg-background/50 p-8 backdrop-blur max-w-md w-full mx-4">
            <h2 className="font-serif text-2xl font-normal text-primary mb-4">पहुंच अस्वीकार की गई</h2>
            <p className="text-foreground/70 mb-6">इस पेज को देखने के लिए आपको लॉग इन करना होगा।</p>
            <a
              href="/reporting"
              className="inline-block w-full rounded-md bg-primary px-4 py-2 font-serif text-primary-foreground transition-all hover:bg-primary/90"
            >
              लॉग इन करें
            </a>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary parchment-texture">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl font-normal text-primary">S.A.H.A.S. प्रशासन डैशबोर्ड</h1>
              <p className="mt-2 text-foreground/70">सभी रिपोर्ट्स को देखें, फ़िल्टर करें और प्रबंधित करें</p>
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm text-primary transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              रीफ़्रेश
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Reports List */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur">
                {/* Search and Filter */}
                <div className="mb-6 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 size-5 text-foreground/40" />
                    <input
                      id="report-search"
                      type="text"
                      placeholder="नाम, स्थान या ID से खोजें"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-md border border-gold/30 bg-background pl-10 pr-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border border-gold/30 bg-background px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none"
                  >
                    <option value="all">सभी स्थितियाँ</option>
                    <option value="new">नई</option>
                    <option value="reviewing">समीक्षा में</option>
                    <option value="acknowledged">स्वीकृत</option>
                    <option value="resolved">समाधान</option>
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-primary/60" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/20">
                          <th className="text-left px-4 py-3 font-serif text-sm font-normal text-foreground/70">रिपोर्टकर्ता</th>
                          <th className="text-left px-4 py-3 font-serif text-sm font-normal text-foreground/70">स्थान</th>
                          <th className="text-left px-4 py-3 font-serif text-sm font-normal text-foreground/70">तारीख</th>
                          <th className="text-left px-4 py-3 font-serif text-sm font-normal text-foreground/70">स्थिति</th>
                          <th className="text-left px-4 py-3 font-serif text-sm font-normal text-foreground/70">कार्रवाई</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.map((report) => (
                          <tr
                            key={report.id}
                            className={`border-b border-gold/10 hover:bg-primary/5 transition-colors cursor-pointer ${selectedReport?.id === report.id ? 'bg-primary/5' : ''}`}
                            onClick={() => setSelectedReport(report)}
                          >
                            <td className="px-4 py-3 text-sm text-foreground">{report.reporter_name}</td>
                            <td className="px-4 py-3 text-sm text-foreground/80 truncate max-w-[140px]">{report.location}</td>
                            <td className="px-4 py-3 text-sm text-foreground/80 whitespace-nowrap">{report.date}</td>
                            <td className="px-4 py-3 text-sm">{getStatusBadge(report.status)}</td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                id={`select-report-${report.id}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedReport(report) }}
                                className="text-primary hover:text-primary/80 transition-colors text-xs underline"
                              >
                                देखें
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredReports.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-foreground/60">कोई रिपोर्ट नहीं मिली।</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Report Details Panel */}
            <div className="rounded-lg border border-gold/30 bg-background/50 p-6 backdrop-blur h-fit sticky top-20">
              {selectedReport ? (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-normal text-primary">रिपोर्ट विवरण</h3>

                  <div className="space-y-3 border-t border-gold/20 pt-4">
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">रिपोर्टकर्ता</p>
                      <p className="text-sm text-foreground">{selectedReport.reporter_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">सदस्य कोड</p>
                      <p className="font-mono text-sm text-primary">
                        {selectedReport.members?.member_code ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">ईमेल</p>
                      {selectedReport.members?.email ? (
                        <a 
                          href={`mailto:${selectedReport.members.email}`} 
                          className="text-sm text-primary underline hover:text-primary/80 transition-colors"
                        >
                          {selectedReport.members.email}
                        </a>
                      ) : (
                        <p className="text-sm text-foreground/70">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">घटना का प्रकार</p>
                      <p className="text-sm text-foreground capitalize">{selectedReport.incident_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">स्थान</p>
                      <p className="text-sm text-foreground">{selectedReport.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">तारीख और समय</p>
                      <p className="text-sm text-foreground">{selectedReport.date} {selectedReport.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">स्थिति</p>
                      <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-wide">विवरण</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>

                    {selectedReport.photos?.length > 0 && (
                      <div>
                        <p className="text-xs text-foreground/60 uppercase tracking-wide mb-2">फ़ोटो</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedReport.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="size-16 rounded-md object-cover border border-gold/30"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status action buttons */}
                  <div className="border-t border-gold/20 pt-4 space-y-2">
                    <p className="text-xs text-foreground/60 uppercase tracking-wide mb-2">स्थिति बदलें</p>
                    {(['new', 'reviewing', 'acknowledged', 'resolved'] as ReportStatus[]).map((s) => (
                      <button
                        key={s}
                        id={`status-${s}-${selectedReport.id}`}
                        onClick={() => updateStatus(selectedReport.id, s)}
                        disabled={selectedReport.status === s || updatingStatus === selectedReport.id}
                        className={`w-full rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-40 ${
                          selectedReport.status === s
                            ? 'bg-primary/20 text-primary font-medium cursor-default'
                            : 'border border-primary/30 text-primary hover:bg-primary/10'
                        }`}
                      >
                        {updatingStatus === selectedReport.id && selectedReport.status !== s ? (
                          <span className="flex items-center justify-center gap-1">
                            <Loader2 className="size-3 animate-spin" />
                            अपडेट हो रहा है…
                          </span>
                        ) : (
                          { new: 'नई', reviewing: 'समीक्षा में', acknowledged: 'स्वीकृत', resolved: 'समाधान' }[s]
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-foreground/60">विवरण देखने के लिए एक रिपोर्ट चुनें।</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'कुल रिपोर्ट्स', value: statCounts.total },
              { label: 'नई', value: statCounts.new },
              { label: 'समीक्षा में', value: statCounts.reviewing },
              { label: 'स्वीकृत', value: statCounts.acknowledged },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-gold/30 bg-background/50 p-4 text-center backdrop-blur"
              >
                <p className="text-2xl font-serif font-normal text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
