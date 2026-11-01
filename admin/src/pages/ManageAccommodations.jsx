import { useCallback, useEffect, useState } from 'react'
import {
  getAccommodations,
  getAmenities,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  createAmenity,
} from '../services/adminApi'
import Modal from '../components/Modal'

const TYPE_SUGGESTIONS = ['Hotel', 'Villa', 'Apartment', 'Resort', 'Chalet', 'Farm']

const EMPTY_FORM = {
  Title: '',
  Description: '',
  Type: '',
  Location: '',
  DistanceKm: '',
  PricePerNight: '',
  ImageURL: '',
  MaxPets: 1,
  AcceptedPetTypes: '',
  AllowedSize: '',
  RequiresVaccination: false,
  AdditionalRulesText: '',
  AmenityIDs: [],
}

const toForm = (a) => ({
  Title: a.Title ?? '',
  Description: a.Description ?? '',
  Type: a.Type ?? '',
  Location: a.Location ?? '',
  DistanceKm: a.DistanceKm ?? '',
  PricePerNight: a.PricePerNight ?? '',
  ImageURL: a.ImageURL ?? '',
  MaxPets: a.Rules?.MaxPets ?? 1,
  AcceptedPetTypes: a.Rules?.AcceptedPetTypes ?? '',
  AllowedSize: a.Rules?.AllowedSize ?? '',
  RequiresVaccination: !!a.Rules?.RequiresVaccination,
  AdditionalRulesText: a.Rules?.AdditionalRulesText ?? '',
  AmenityIDs: (a.Amenities || []).map((am) => am.AmenityID),
})

export default function ManageAccommodations() {
  const [items, setItems] = useState([])
  const [amenities, setAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null) // { type, text }
  const [editing, setEditing] = useState(null) // null | 'new' | accommodation

  const load = useCallback(async () => {
    try {
      const [acc, am] = await Promise.all([getAccommodations(), getAmenities()])
      setItems(acc)
      setAmenities(am)
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.Title}"? This cannot be undone.`)) return
    try {
      await deleteAccommodation(a.AccommodationID)
      setNotice({ type: 'success', text: `"${a.Title}" was deleted.` })
      await load()
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    }
  }

  const handleSaved = async (message) => {
    setEditing(null)
    setNotice({ type: 'success', text: message })
    await load()
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-sand-soft/30 min-h-screen font-sans text-cocoa">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-cocoa">Accommodations</h1>
        <button 
          className="px-5 py-2.5 bg-cocoa hover:bg-cocoa-hover text-white font-medium rounded-xl shadow-sm transition-all text-sm w-full sm:w-auto"
          onClick={() => setEditing('new')}
        >
          + Add accommodation
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div 
          className={`p-4 rounded-xl text-sm border cursor-pointer transition-all ${
            notice.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-600' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
          onClick={() => setNotice(null)}
        >
          {notice.text}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white border border-edge rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-cocoa/70 p-8 text-center text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-cocoa/70 p-8 text-center text-sm">No accommodations yet. Add your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-edge text-xs font-semibold text-cocoa/70 uppercase tracking-wider bg-sand-soft/20">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Price / night</th>
                  <th className="py-3 px-4">Max pets</th>
                  <th className="py-3 px-4">Amenities</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/50 text-sm text-cocoa">
                {items.map((a) => (
                  <tr key={a.AccommodationID} className="hover:bg-sand-soft/20 transition-colors">
                    <td className="py-3 px-4">
                      {a.ImageURL ? (
                        <img className="w-12 h-12 object-cover rounded-xl border border-edge" src={a.ImageURL} alt="" />
                      ) : (
                        <div className="w-12 h-12 bg-sand rounded-xl border border-edge flex items-center justify-center text-xs text-cocoa/50">N/A</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold">{a.Title}</td>
                    <td className="py-3 px-4">{a.Type}</td>
                    <td className="py-3 px-4">{a.Location}</td>
                    <td className="py-3 px-4 font-medium">${Number(a.PricePerNight).toFixed(2)}</td>
                    <td className="py-3 px-4">{a.Rules?.MaxPets ?? '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(a.Amenities || []).map((am) => (
                          <span className="px-2 py-0.5 bg-sand-soft border border-edge rounded-lg text-xs font-medium text-cocoa" key={am.AmenityID}>
                            {am.Name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="px-3 py-1.5 text-xs font-medium bg-sand hover:bg-edge text-cocoa rounded-lg transition-all"
                          onClick={() => setEditing(a)}
                        >
                          Edit
                        </button>
                        <button 
                          className="px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all border border-red-200"
                          onClick={() => handleDelete(a)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <AccommodationForm
          accommodation={editing === 'new' ? null : editing}
          amenities={amenities}
          onAmenityCreated={(am) => setAmenities((prev) => [...prev, am].sort((x, y) => x.Name.localeCompare(y.Name)))}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function AccommodationForm({ accommodation, amenities, onAmenityCreated, onClose, onSaved }) {
  const isEdit = !!accommodation
  const [form, setForm] = useState(isEdit ? toForm(accommodation) : EMPTY_FORM)
  const [newAmenity, setNewAmenity] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const toggleAmenity = (id) =>
    setForm((f) => ({
      ...f,
      AmenityIDs: f.AmenityIDs.includes(id) ? f.AmenityIDs.filter((x) => x !== id) : [...f.AmenityIDs, id],
    }))

  const addAmenity = async () => {
    const name = newAmenity.trim()
    if (!name) return
    setError('')
    try {
      const am = await createAmenity(name)
      onAmenityCreated(am)
      setForm((f) => ({ ...f, AmenityIDs: [...f.AmenityIDs, am.AmenityID] }))
      setNewAmenity('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await updateAccommodation(accommodation.AccommodationID, form)
        await onSaved('Accommodation updated successfully.')
      } else {
        await createAccommodation(form)
        await onSaved('Accommodation created successfully.')
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? `Edit: ${accommodation.Title}` : 'Add accommodation'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {error && <div className="col-span-full bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa col-span-full">
          <span>Title *</span>
          <input 
            value={form.Title} 
            onChange={set('Title')} 
            maxLength={150} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Type *</span>
          <input 
            value={form.Type} 
            onChange={set('Type')} 
            list="type-suggestions" 
            maxLength={50} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
          <datalist id="type-suggestions">
            {TYPE_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Location *</span>
          <input 
            value={form.Location} 
            onChange={set('Location')} 
            maxLength={100} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Price per night *</span>
          <input 
            type="number" 
            min="0.01" 
            step="0.01" 
            value={form.PricePerNight} 
            onChange={set('PricePerNight')} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Distance (km)</span>
          <input 
            type="number" 
            min="0" 
            max="999.99" 
            step="0.01" 
            value={form.DistanceKm} 
            onChange={set('DistanceKm')} 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa col-span-full">
          <span>Image URL</span>
          <input 
            type="url" 
            value={form.ImageURL} 
            onChange={set('ImageURL')} 
            maxLength={255} 
            placeholder="https://…" 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa col-span-full">
          <span>Description</span>
          <textarea 
            rows={3} 
            value={form.Description} 
            onChange={set('Description')} 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <h3 className="col-span-full text-lg font-bold text-cocoa pt-4 border-t border-edge">Pet rules</h3>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Max pets</span>
          <input 
            type="number" 
            min="1" 
            step="1" 
            value={form.MaxPets} 
            onChange={set('MaxPets')} 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Accepted pet types</span>
          <input 
            value={form.AcceptedPetTypes} 
            onChange={set('AcceptedPetTypes')} 
            maxLength={100} 
            placeholder="Dogs, Cats" 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Allowed size</span>
          <input 
            value={form.AllowedSize} 
            onChange={set('AllowedSize')} 
            maxLength={50} 
            placeholder="Small, Medium" 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex items-center gap-2.5 text-sm font-medium text-cocoa cursor-pointer pt-6">
          <input 
            type="checkbox" 
            checked={form.RequiresVaccination} 
            onChange={set('RequiresVaccination')} 
            className="w-4 h-4 rounded text-cocoa focus:ring-cocoa border-edge"
          />
          <span>Requires vaccination</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa col-span-full">
          <span>Additional rules</span>
          <textarea 
            rows={2} 
            value={form.AdditionalRulesText} 
            onChange={set('AdditionalRulesText')} 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <h3 className="col-span-full text-lg font-bold text-cocoa pt-4 border-t border-edge">Amenities</h3>

        <div className="col-span-full flex flex-wrap gap-2">
          {amenities.length === 0 && <span className="text-sm text-cocoa/70">No amenities yet — add one below.</span>}
          {amenities.map((am) => (
            <label 
              key={am.AmenityID} 
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                form.AmenityIDs.includes(am.AmenityID)
                  ? 'bg-cocoa text-white border-cocoa shadow-sm'
                  : 'bg-sand-soft/30 border-edge text-cocoa hover:bg-sand-soft'
              }`}
            >
              <input
                type="checkbox"
                checked={form.AmenityIDs.includes(am.AmenityID)}
                onChange={() => toggleAmenity(am.AmenityID)}
                className="hidden"
              />
              <span>{am.Name}</span>
            </label>
          ))}
        </div>

        <div className="col-span-full flex gap-2 pt-2">
          <input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addAmenity()
              }
            }}
            maxLength={50}
            placeholder="New amenity name (e.g. Pet bed)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa text-sm transition-all"
          />
          <button 
            type="button" 
            className="px-4 py-2.5 bg-sand hover:bg-edge text-cocoa font-medium rounded-xl text-sm transition-all shrink-0"
            onClick={addAmenity}
          >
            Add amenity
          </button>
        </div>

        <div className="col-span-full flex items-center justify-end gap-3 pt-6 border-t border-edge mt-4">
          <button 
            type="button" 
            className="px-5 py-2.5 bg-sand hover:bg-edge text-cocoa font-medium rounded-xl text-sm transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-cocoa hover:bg-cocoa-hover text-white font-medium rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create accommodation'}
          </button>
        </div>
      </form>
    </Modal>
  )
}