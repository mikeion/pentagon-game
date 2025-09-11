#!/usr/bin/env python3
"""
Pentagon Complex Number Game
A mathematical puzzle game where players manipulate complex numbers on pentagon vertices
"""

class PentagonGame:
    def __init__(self):
        # Initialize pentagon with complex numbers
        # Using 0-indexed vertices (0-4) going clockwise
        self.vertices = [
            2 + 4j,  # vertex 0 (top)
            2 + 0j,  # vertex 1 (top-right)
            2 + 2j,  # vertex 2 (bottom-right)
            3 + 4j,  # vertex 3 (bottom-left)
            1 + 3j   # vertex 4 (top-left)
        ]
        
        # Pentagon adjacency (each vertex connected to its 3 neighbors)
        self.adjacency = {
            0: [1, 2, 3, 4],  # vertex 0 connects to all others except itself
            1: [0, 2, 3, 4],
            2: [0, 1, 3, 4],
            3: [0, 1, 2, 4],
            4: [0, 1, 2, 3]
        }
        
        # Actually, in a pentagon each vertex connects to 2 adjacent vertices
        # Let me fix the adjacency for a regular pentagon
        self.adjacency = {
            0: [1, 4],  # vertex 0 connects to 1 and 4
            1: [0, 2],  # vertex 1 connects to 0 and 2
            2: [1, 3],  # vertex 2 connects to 1 and 3
            3: [2, 4],  # vertex 3 connects to 2 and 4
            4: [3, 0]   # vertex 4 connects to 3 and 0
        }
        
        self.current_move_type = 'A'  # Default to Move A
        
    def apply_move(self, vertex_index, operation='add'):
        """
        Apply a move to a vertex and its adjacent vertices
        
        Args:
            vertex_index: Index of the vertex to apply the move to (0-4)
            operation: 'add' for left-click (+), 'subtract' for right-click (-)
        """
        if vertex_index < 0 or vertex_index > 4:
            raise ValueError(f"Invalid vertex index: {vertex_index}")
        
        # Get the value to apply based on move type (corrected to match Alex's PDF)
        move_values = {
            'A': (1 + 1j, -1 + 0j),  # Add 1+i to vertex, -1 to adjacent
            'B': (-1 + 1j, -1j),     # Add -1+i to vertex, -i to adjacent  
            'C': (1 - 1j, 1 + 0j),   # Add 1-i to vertex, 1 to adjacent
            'D': (1 - 1j, 1j)        # Add 1-i to vertex, i to adjacent
        }
        
        vertex_val, adjacent_val = move_values[self.current_move_type]
        
        # If subtracting, negate the values
        if operation == 'subtract':
            vertex_val = -vertex_val
            adjacent_val = -adjacent_val
        
        # Apply to the selected vertex
        old_vertices = self.vertices.copy()
        self.vertices[vertex_index] += vertex_val
        
        # Apply to adjacent vertices
        for adj_idx in self.adjacency[vertex_index]:
            self.vertices[adj_idx] += adjacent_val
            
        return old_vertices  # Return old state for undo functionality
    
    def set_move_type(self, move_type):
        """Set the current move type (A, B, C, or D)"""
        if move_type not in ['A', 'B', 'C', 'D']:
            raise ValueError(f"Invalid move type: {move_type}")
        self.current_move_type = move_type
    
    def get_state_string(self):
        """Get a string representation of the current state"""
        return str([complex(round(v.real), round(v.imag)) for v in self.vertices])
    
    def display(self):
        """Display the current state of the pentagon"""
        print("\nPentagon State:")
        print(f"  Vertex 0 (top):    {self.vertices[0]}")
        print(f"  Vertex 1 (right):  {self.vertices[1]}")  
        print(f"  Vertex 2 (bot-r):  {self.vertices[2]}")
        print(f"  Vertex 3 (bot-l):  {self.vertices[3]}")
        print(f"  Vertex 4 (left):   {self.vertices[4]}")
        print(f"\nCurrent move type: {self.current_move_type}")
    
    def set_configuration(self, config):
        """Set the pentagon to a specific configuration"""
        if len(config) != 5:
            raise ValueError("Configuration must have exactly 5 complex numbers")
        self.vertices = list(config)
    
    def check_win(self, goal_config):
        """Check if current configuration matches the goal"""
        return all(abs(self.vertices[i] - goal_config[i]) < 0.001 
                  for i in range(5))


def test_game():
    """Test the game mechanics"""
    game = PentagonGame()
    
    print("Initial state:")
    game.display()
    
    # Test Move A on vertex 0
    print("\n--- Testing Move A on vertex 0 (left-click) ---")
    game.set_move_type('A')
    game.apply_move(0, 'add')
    game.display()
    
    # Test Move B on vertex 1
    print("\n--- Testing Move B on vertex 1 (left-click) ---")
    game.set_move_type('B')
    game.apply_move(1, 'add')
    game.display()
    
    # Test Move C on vertex 0 (right-click = subtract)
    print("\n--- Testing Move C on vertex 0 (right-click) ---")
    game.set_move_type('C')
    game.apply_move(0, 'subtract')
    game.display()
    
    # Test Move D
    print("\n--- Testing Move D on vertex 3 (left-click) ---")
    game.set_move_type('D')
    game.apply_move(3, 'add')
    game.display()
    
    # Reset and test orbit detection
    print("\n--- Testing configuration tracking ---")
    game2 = PentagonGame()
    seen_states = set()
    
    # Apply random moves and track unique states
    import random
    for i in range(20):
        move = random.choice(['A', 'B', 'C', 'D'])
        vertex = random.randint(0, 4)
        op = random.choice(['add', 'subtract'])
        
        game2.set_move_type(move)
        game2.apply_move(vertex, op)
        
        state = game2.get_state_string()
        if state not in seen_states:
            seen_states.add(state)
            print(f"Move {i+1}: {move} on vertex {vertex} ({op}) - New state found")
    
    print(f"\nFound {len(seen_states)} unique states in 20 moves")
    

if __name__ == "__main__":
    test_game()