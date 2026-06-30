import test from 'node:test'
import assert from 'node:assert/strict'
import { CARDS, shareUrlFor, buildShareTargets } from './share.js'

test('there are six cards, brand first', () => {
  assert.equal(CARDS.length, 6)
  assert.equal(CARDS[0].slug, 'brand')
})

test('every card has a rendered PNG and a blurb', () => {
  for (const c of CARDS) {
    assert.match(c.img, /^\/og\/[a-z]+\.png$/)
    assert.ok(c.blurb.length > 0)
  }
})

test('brand shares the root URL', () => {
  assert.equal(shareUrlFor('brand'), 'https://thecenterisalie.org/')
})

test('non-brand cards share their per-card stub path', () => {
  assert.equal(shareUrlFor('zero'), 'https://thecenterisalie.org/s/zero/')
  assert.equal(shareUrlFor('window'), 'https://thecenterisalie.org/s/window/')
})

test('X target encodes the blurb and the card URL', () => {
  const t = buildShareTargets('zero')
  assert.ok(t.x.startsWith('https://x.com/intent/post?text='))
  assert.ok(t.x.includes(encodeURIComponent('https://thecenterisalie.org/s/zero/')))
})

test('Bluesky target carries the URL inside the text', () => {
  const t = buildShareTargets('window')
  assert.ok(t.bluesky.startsWith('https://bsky.app/intent/compose?text='))
  assert.ok(decodeURIComponent(t.bluesky).includes('https://thecenterisalie.org/s/window/'))
})

test('LinkedIn target passes the card URL as ?url', () => {
  const t = buildShareTargets('trust')
  assert.ok(t.linkedin.includes(encodeURIComponent('https://thecenterisalie.org/s/trust/')))
})

test('Instagram caption ends with the canonical root link', () => {
  const t = buildShareTargets('zero')
  assert.ok(t.instagramCaption.endsWith('https://thecenterisalie.org/'))
})

test('unknown slug throws', () => {
  assert.throws(() => buildShareTargets('nope'))
})
