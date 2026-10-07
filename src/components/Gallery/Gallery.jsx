import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import Nav from '../nav/Nav'
import { apiAssetUrl, apiUrl } from '../../api'
import './Gallery.css'

const categories = [
  { id: 'petals', label: 'Petals', displayLabel: 'Petals Garlands' },
  { id: 'tuberose', label: 'Sampangi', displayLabel: 'Sampangi Garlands' },
  { id: 'lotus-crape-jasmine', label: 'Lotus & Crape jasmine', displayLabel: 'Lotus & Crape Jasmine Garland' },
  { id: 'cardamom', label: 'Cardamom', displayLabel: 'Cardamom Garlands' },
  { id: 'bouquet', label: 'Bouquet', displayLabel: 'Bouquet' },
]
const API_URL = apiUrl('/api/garlands')
const emptyForm = { discount: '', actualPrice: '', discountPrice: '', description: '' }

const Gallery = () => {
  const [garlands, setGarlands] = useState([])
  const [activeCategory, setActiveCategory] = useState('petals')
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isActive = true
    axios.get(API_URL)
      .then(({ data }) => {
        if (!isActive) return
        const records = Array.isArray(data) ? data : data?.data
        setGarlands(Array.isArray(records) ? records : [])
      })
      .catch(() => {
        if (isActive) setLoadError('Could not load garlands. Please refresh and try again.')
      })
    return () => { isActive = false }
  }, [])

  const selectedGarlands = useMemo(
    () => garlands.filter((garland) => garland.category === activeCategory),
    [garlands, activeCategory],
  )

  const cards = selectedGarlands.map((garland) => {
    const photos = Array.isArray(garland.photos) ? garland.photos : []
    const photoUrls = photos.map((photo) => {
      const path = typeof photo === 'string' ? photo : photo?.url || photo?.path
      return path ? apiAssetUrl(path) : ''
    }).filter(Boolean)
    return { ...garland, photoUrls }
  })

  const activeLabel = categories.find((category) => category.id === activeCategory)?.label
  const calculatedDiscountPrice = editForm.discount !== '' && editForm.actualPrice !== ''
    ? Math.max(0, Math.round(Number(editForm.actualPrice) * (1 - Number(editForm.discount) / 100)))
    : ''

  const openEditor = (garland) => {
    setEditing(garland)
    setEditForm({
      discount: String(garland.discount ?? ''),
      actualPrice: String(garland.actualPrice ?? ''),
      description: garland.description || '',
    })
    setActionError('')
  }

  const handleEdit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setActionError('')
    const discount = Number(editForm.discount)
    const actualPrice = Number(editForm.actualPrice)
    const discountPrice = Math.max(0, Math.round(actualPrice * (1 - discount / 100)))
    const payload = { discount, actualPrice, discountPrice, description: editForm.description.trim() }

    try {
      await axios.put(`${API_URL}/${editing._id || editing.id}`, payload)
      const editingId = editing._id || editing.id
      setGarlands((current) => current.map((item) =>
        (item._id || item.id) === editingId ? { ...item, ...payload } : item,
      ))
      setEditing(null)
      axios.get(API_URL).then(({ data }) => {
        const records = Array.isArray(data) ? data : data?.data
        if (Array.isArray(records)) setGarlands(records)
      }).catch(() => {})
    } catch (error) {
      const message = error.response?.data?.message || error.message
      setActionError(`Could not update this garland${error.response?.status ? ` (${error.response.status})` : ''}: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (garland) => {
    setDeleteTarget(garland)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setActionError('')
    try {
      await axios.delete(`${API_URL}/${deleteTarget._id || deleteTarget.id}`)
      setGarlands((current) => current.filter((item) => (item._id || item.id) !== (deleteTarget._id || deleteTarget.id)))
      setDeleteTarget(null)
    } catch (error) {
      setActionError(error.response?.data?.message || 'Could not delete this garland. Please try again.')
    }
  }

  return (
    <div className="gallery-page">
      <Nav />
      <main className="gallery-content container">
        <header className="gallery-heading">
          <span className="gallery-kicker">Freshly made</span>
          <h1>Garland Gallery</h1>
          <p>Browse garlands by flower and style.</p>
        </header>

        <div className="gallery-categories" role="group" aria-label="Garland categories">
          {categories.map((category) => (
            <button
              className={`btn gallery-category${activeCategory === category.id ? ' active' : ''}`}
              type="button"
              key={category.id}
              aria-pressed={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {(loadError || actionError) && <p className="gallery-message gallery-error" role="alert">{loadError || actionError}</p>}
        {!loadError && cards.length === 0 && (
          <section className="gallery-empty" aria-live="polite">
            <span className="gallery-empty-flower" aria-hidden="true">✿</span>
            <h2>No {activeLabel} garlands yet</h2>
            <p>Add a garland from the Forms page and it will appear here.</p>
          </section>
        )}

        {cards.length > 0 && (
          <section className="gallery-grid" aria-label={`${activeLabel} garlands`}>
            {cards.map((garland) => (
              <article className="gallery-card" key={garland._id || garland.id}>
                <div className="gallery-card-media">
                  {garland.photoUrls.length > 0
                    ? <button className="gallery-image-preview" type="button" aria-label={`View ${activeLabel} garland photo`} onClick={() => setPreviewImage({ photos: garland.photoUrls, index: 0, alt: `${garland.name || activeLabel} garland` })}><img className="gallery-card-image" src={garland.photoUrls[0]} alt="" /></button>
                    : <div className="gallery-card-placeholder" aria-label="No photo uploaded">✿</div>}
                  <span className="gallery-discount-badge">{garland.discount}% OFF</span>
                  {garland.photoUrls.length > 0 && <span className="gallery-image-count-badge">{garland.photoUrls.length} {garland.photoUrls.length === 1 ? 'photo' : 'photos'}</span>}
                </div>
                <div className="gallery-card-body">
                  {(garland.name || garland.title) && <h2 className="gallery-card-title">{garland.name || garland.title}</h2>}
                  {garland.description && <p className="gallery-card-description">{garland.description}</p>}
                  <div className="gallery-card-prices">
                    <strong>₹{garland.discountPrice}</strong>
                    <del>₹{garland.actualPrice}</del>
                    <span className="gallery-savings">Save ₹{Math.max(0, Number(garland.actualPrice || 0) - Number(garland.discountPrice || 0))}</span>
                  </div>
                  <div className="gallery-card-actions">
                    <button className="gallery-action-edit" type="button" onClick={() => openEditor(garland)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" /></svg> Edit</button>
                    <button className="gallery-action-delete" type="button" onClick={() => handleDelete(garland)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg> Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {editing && (
          <div className="gallery-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null) }}>
            <section className="gallery-edit-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-edit-title">
              <h2 id="gallery-edit-title">Edit Garland</h2>
              <form onSubmit={handleEdit}>
                <div className="gallery-edit-row">
                  <label>Discount (%)<input type="number" min="0" max="100" value={editForm.discount} onWheel={(event) => { event.preventDefault(); event.currentTarget.blur() }} onChange={(event) => setEditForm({ ...editForm, discount: event.target.value })} required /></label>
                  <label>Actual price<input type="number" min="0" value={editForm.actualPrice} onWheel={(event) => { event.preventDefault(); event.currentTarget.blur() }} onChange={(event) => setEditForm({ ...editForm, actualPrice: event.target.value })} required /></label>
                </div>
                <label>Discount price<input type="number" value={calculatedDiscountPrice} readOnly /></label>
                <label>Description<textarea rows="3" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} /></label>
                {actionError && <p className="gallery-error" role="alert">{actionError}</p>}
                <div className="gallery-edit-actions">
                  <button type="button" className="gallery-action-edit" onClick={() => setEditing(null)}>Cancel</button>
                  <button type="submit" className="gallery-action-save" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {deleteTarget && createPortal((
          <div className="gallery-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null) }}>
            <section className="gallery-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="gallery-delete-title" aria-describedby="gallery-delete-message">
              <h2 id="gallery-delete-title">Delete garland?</h2>
              <p id="gallery-delete-message">Are you sure you want to delete this garland? This action cannot be undone.</p>
              <div className="gallery-confirm-actions">
                <button type="button" className="gallery-action-edit" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button type="button" className="gallery-action-delete" onClick={confirmDelete}>Confirm</button>
              </div>
            </section>
          </div>
        ), document.body)}

        {previewImage && (
          <div className="gallery-modal-backdrop gallery-image-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewImage(null) }}>
            <div className="gallery-image-viewer" role="dialog" aria-modal="true" aria-label={previewImage.alt}>
              <img className="gallery-image-large" src={previewImage.photos[previewImage.index]} alt={`${previewImage.alt}, photo ${previewImage.index + 1} of ${previewImage.photos.length}`} />
              {previewImage.photos.length > 1 && <>
                <button className="gallery-image-arrow gallery-image-arrow-left" type="button" aria-label="Previous photo" onClick={() => setPreviewImage((current) => ({ ...current, index: (current.index - 1 + current.photos.length) % current.photos.length }))}>‹</button>
                <button className="gallery-image-arrow gallery-image-arrow-right" type="button" aria-label="Next photo" onClick={() => setPreviewImage((current) => ({ ...current, index: (current.index + 1) % current.photos.length }))}>›</button>
              </>}
              <button className="gallery-image-close" type="button" aria-label="Close image preview" onClick={() => setPreviewImage(null)}>×</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Gallery
