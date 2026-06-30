import test from 'node:test'
import assert from 'node:assert/strict'
import { CARDS, shareUrlFor, buildShareTargets, imageUrlFor } from './share.js'

const MANIFEST = {
  brand: { file: 'brand.aaaa1111.png' },
  zero: { file: 'zero.bbbb2222.png' },
  trust: { file: 'trust.cccc3333.png' },
  window: { file: 'window.dddd4444.png' },
}

test('there are six cards, brand first', () => {
  assert.equal(CARDS.length, 6)
  assert.equal(CARDS[0].slug, 'brand')
})

test('every card has a blurb and a plain desc', () => {
  for (const c of CARDS) {
    assert.ok(c.blurb.length > 0)
    assert.ok(c.desc.length > 0)
  }
})

test('brand shares the root URL', () => {
  assert.equal(shareUrlFor('brand'), 'https://thecenterisalie.org/')
})

test('non-brand cards share their per-card stub path', () => {
  assert.equal(shareUrlFor('zero'), 'https://thecenterisalie.org/s/zero/')
  assert.equal(shareUrlFor('window'), 'https://thecenterisalie.org/s/window/')
})

test('imageUrlFor uses the hashed manifest filename, falls back without it', () => {
  assert.equal(imageUrlFor('zero', MANIFEST), '/og/zero.bbbb2222.png')
  assert.equal(imageUrlFor('zero', {}), '/og/zero.png')
})

test('X target encodes the blurb and the card URL', () => {
  const t = buildShareTargets('zero', MANIFEST)
  assert.ok(t.x.startsWith('https://x.com/intent/post?text='))
  assert.ok(t.x.includes(encodeURIComponent('https://thecenterisalie.org/s/zero/')))
})

test('Bluesky target carries the URL inside the text', () => {
  const t = buildShareTargets('window', MANIFEST)
  assert.ok(t.bluesky.startsWith('https://bsky.app/intent/compose?text='))
  assert.ok(decodeURIComponent(t.bluesky).includes('https://thecenterisalie.org/s/window/'))
})

test('LinkedIn target passes the card URL as ?url', () => {
  const t = buildShareTargets('trust', MANIFEST)
  assert.ok(t.linkedin.includes(encodeURIComponent('https://thecenterisalie.org/s/trust/')))
})

test('share target image resolves to the hashed file', () => {
  const t = buildShareTargets('zero', MANIFEST)
  assert.equal(t.image, '/og/zero.bbbb2222.png')
})

test('Instagram caption ends with the canonical root link', () => {
  const t = buildShareTargets('zero', MANIFEST)
  assert.ok(t.instagramCaption.endsWith('https://thecenterisalie.org/'))
})

test('unknown slug throws', () => {
  assert.throws(() => buildShareTargets('nope', MANIFEST))
})
