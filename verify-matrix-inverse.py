#!/usr/bin/env python3
"""Verify that the inverse matrix in matrix-solver-mathjs.ts is correct"""

import numpy as np

# Define K̄ = I₅ - Di from the paper (line 208)
# Paper specifies:
# [1+i,  -i,   0,   0,  -i ]
# [ -i, 1+i,  -i,   0,   0 ]
# [  0,  -i, 1+i,  -i,   0 ]
# [  0,   0,  -i, 1+i,  -i ]
# [ -i,   0,   0,  -i, 1+i ]

K_bar = np.array([
    [1+1j, -1j,   0,   0, -1j],
    [-1j, 1+1j, -1j,   0,   0],
    [  0,  -1j, 1+1j, -1j,   0],
    [  0,    0, -1j, 1+1j, -1j],
    [-1j,    0,   0,  -1j, 1+1j]
])

print('K̄ matrix (from paper):')
print(K_bar)

# Compute K̄⁻¹
K_bar_inverse = np.linalg.inv(K_bar)

print('\nK̄⁻¹ (computed):')
print(K_bar_inverse)

# Our CORRECTED matrix from matrix-solver-mathjs.ts (unscaled)
OUR_MATRIX = np.array([
    [3-1j, 1+1j, -1+1j, -1+1j, 1+1j],
    [1+1j, 3-1j, 1+1j, -1+1j, -1+1j],
    [-1+1j, 1+1j, 3-1j, 1+1j, -1+1j],
    [-1+1j, -1+1j, 1+1j, 3-1j, 1+1j],
    [1+1j, -1+1j, -1+1j, 1+1j, 3-1j]
])

print('\nOur hardcoded matrix (before 1/6 scaling):')
print(OUR_MATRIX)

# Scale by 1/6 as we do in the code
OUR_SCALED = OUR_MATRIX / 6

print('\nOur matrix (after 1/6 scaling):')
print(OUR_SCALED)

# Check if they're equal
print('\n=== VERIFICATION ===')
diff = K_bar_inverse - OUR_SCALED
max_diff = np.max(np.abs(diff))
print(f'Maximum difference: {max_diff}')

if max_diff < 1e-10:
    print('✓ CORRECT: Our matrix matches K̄⁻¹ from the paper!')
else:
    print('✗ ERROR: Our matrix does NOT match K̄⁻¹!')
    print('\nExpected K̄⁻¹:')
    for i in range(5):
        print([f'{K_bar_inverse[i,j]:.6f}' for j in range(5)])
    print('\nDifference matrix:')
    print(diff)

# Verify that K̄ * K̄⁻¹ = I
print('\n=== IDENTITY CHECK ===')
identity = K_bar @ K_bar_inverse
print('K̄ × K̄⁻¹ (should be identity):')
print(identity)
print('\nIs it identity? (max deviation from I):')
expected_identity = np.eye(5)
identity_diff = np.max(np.abs(identity - expected_identity))
print(f'{identity_diff:.2e}')
if identity_diff < 1e-10:
    print('✓ YES: K̄ × K̄⁻¹ = I')
