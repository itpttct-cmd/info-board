/*
# Add K3 and Machine positions to sidebar_content

1. Changes
- Remove the old CHECK constraint on sidebar_content.position
- Add a new CHECK constraint allowing: 'apd', 'form', 'k3', 'machine'
- This adds two new sidebar panels: K3 Info (right top) and Machine Damage Info (right bottom)

2. Security
- No security changes. Existing RLS policies remain valid.
*/

ALTER TABLE sidebar_content DROP CONSTRAINT IF EXISTS sidebar_content_position_check;

ALTER TABLE sidebar_content ADD CONSTRAINT sidebar_content_position_check
  CHECK (position IN ('apd', 'form', 'k3', 'machine'));