import React, { useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '../../api'
import Nav from '../nav/Nav'
import './Form.css'

const Forms = () => {
  const [photoNames, setPhotoNames] = useState([])
  const [photoError, setPhotoError] = useState('')
  const [discount, setDiscount] = useState('')
  const [actualPrice, setActualPrice] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const photoInputRef = useRef(null)
  const navigate = useNavigate()

  const discountPrice = discount !== '' && actualPrice !== ''
    ? Math.max(0, Math.round(Number(actualPrice) * (1 - Number(discount) / 100)))
    : ''

  const handlePhotos = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 10) {
      setPhotoError('You can select a maximum of 10 photos.')
      setPhotoNames([])
      event.target.value = ''
      return
    }
    setPhotoError('')
    setPhotoNames(files.map((file) => file.name))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    const formData = new FormData(event.currentTarget)
    const photos = formData.getAll('photos').filter((file) => file instanceof File && file.size > 0)
    if (photos.length < 1 || photos.length > 10) {
      setPhotoError('Please select between 1 and 10 photos.')
      return
    }
    setPhotoError('')
    const payload = new FormData()
    payload.append('category', String(formData.get('category') || ''))
    payload.append('name', String(formData.get('name') || '').trim())
    payload.append('discount', String(formData.get('discount') || ''))
    payload.append('actualPrice', String(formData.get('actualPrice') || ''))
    payload.append('discountPrice', String(discountPrice))
    payload.append('description', String(formData.get('description') || '').trim())
    photos.forEach((photo) => payload.append('photos', photo))

    try {
      setIsSubmitting(true)
      await axios.post(apiUrl('/api/garlands'), payload)
      navigate('/gallery')
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Could not save this garland. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="forms-page">
      <Nav />
      <main className="forms-content container">
        <section className="garland-form-card" aria-labelledby="garland-form-title">
          <div className="garland-form-heading">
            <span className="garland-form-kicker">Product details</span>
            <h1 id="garland-form-title">Add Garland</h1>
            <p>Enter the garland details and upload its photos.</p>
          </div>

          <form className="garland-form" onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12">
                <label htmlFor="garland-category" className="form-label">Garland category</label>
                <select id="garland-category" name="category" className="form-select garland-control" defaultValue="" required>
                  <option value="" disabled>Select a category</option>
                  <option value="petals">Petals Garlans</option>
                  <option value="tuberose">Sampangi Garlands</option>
                  <option value="lotus-crape-jasmine">Lotus &amp; Crape jasmine Garlan</option>
                  <option value="cardamom">Cardamom Garlands</option>
                  <option value="bouquet">Bouquet</option>
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="garland-name" className="form-label">Garland name</label>
                <input id="garland-name" name="name" className="form-control garland-control" type="text" placeholder="Enter garland name" required />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="discount" className="form-label">Discount (%)</label> 
                <div className="input-group">
                  <input id="discount" name="discount" className="form-control garland-control" type="number" min="0" max="100" step="1" inputMode="numeric" placeholder="Enter discount" value={discount} onWheel={(event) => { event.preventDefault(); event.currentTarget.blur() }} onChange={(event) => setDiscount(event.target.value)} required />
                  <span className="input-group-text garland-addon">%</span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="actual-price" className="form-label">Actual price</label>
                <div className="input-group">
                  <span className="input-group-text garland-addon">₹</span>
                  <input id="actual-price" name="actualPrice" className="form-control garland-control" type="number" min="0" step="1" inputMode="numeric" placeholder="Enter actual price" value={actualPrice} onWheel={(event) => { event.preventDefault(); event.currentTarget.blur() }} onChange={(event) => setActualPrice(event.target.value)} required />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="discount-price" className="form-label">Discount price</label>
                <div className="input-group">
                  <span className="input-group-text garland-addon">₹</span>
                  <input id="discount-price" name="discountPrice" className="form-control garland-control" type="number" min="0" step="1" inputMode="numeric" value={discountPrice === '' ? '' : discountPrice} readOnly aria-describedby="discount-price-help" />
                </div>
                <div id="discount-price-help" className="form-text garland-help">Calculated from actual price and discount.</div>
              </div>

              <div className="col-12">
                <label htmlFor="garland-description" className="form-label">Description</label>
                <textarea id="garland-description" name="description" className="form-control garland-control garland-description" rows="4" placeholder="Enter garland details" />
              </div>

              <div className="col-12">
                <p className="form-label">Add garland photos</p>
                <input ref={photoInputRef} id="garland-photos" name="photos" className="visually-hidden" type="file" accept="image/*" multiple onChange={handlePhotos} tabIndex="-1" />
                <div className="garland-file-picker form-control garland-control">
                  <button className="garland-file-button" type="button" aria-controls="garland-photos" onClick={() => photoInputRef.current?.click()}>
                    Choose files
                  </button>
                  <span className="garland-file-status">{photoNames.length ? photoNames.join(', ') : 'No files chosen'}</span>
                </div>
                <div className="form-text garland-help">Select 1 to 10 photos.</div>
                {photoError && <p className="garland-submit-error" role="alert">{photoError}</p>}
              </div>
            </div>

            <div className="garland-form-footer">
              {submitError && <p className="garland-submit-error" role="alert">{submitError}</p>}
              <button className="btn garland-submit-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit'} <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default Forms
