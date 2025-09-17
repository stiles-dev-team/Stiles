<?php
// Test script to verify fuzzy search logic
echo "Testing Fuzzy Search Logic\n";
echo "========================\n\n";

// Test function to simulate the fuzzy search logic
function testFuzzySearch($searchQuery) {
    echo "Testing search query: '{$searchQuery}'\n";
    
    // Normalize search query - remove special characters and convert to lowercase
    $normalizedQuery = strtolower(preg_replace('/[^a-zA-Z0-9\s]/', '', $searchQuery));
    
    // Create fuzzy search variations for better matching
    $fuzzySearchTerms = [];
    
    // Add the original normalized query
    $fuzzySearchTerms[] = $normalizedQuery;
    
    // If the query contains spaces, also try without spaces (e.g., "Kit Kat" -> "kitkat")
    if (strpos($normalizedQuery, ' ') !== false) {
        $fuzzySearchTerms[] = str_replace(' ', '', $normalizedQuery);
    }
    
    // If the query doesn't contain spaces, try adding spaces between characters (e.g., "kitkat" -> "kit kat")
    if (strpos($normalizedQuery, ' ') === false && strlen($normalizedQuery) > 3) {
        // Try different space combinations for longer words
        $word = $normalizedQuery;
        for ($i = 1; $i < strlen($word) - 1; $i++) {
            $fuzzySearchTerms[] = substr($word, 0, $i) . ' ' . substr($word, $i);
        }
    }
    
    // Create search patterns for all fuzzy terms
    $searchPatterns = [];
    foreach ($fuzzySearchTerms as $term) {
        $searchPatterns[] = "%{$term}%";
        $searchPatterns[] = $term . '%'; // starts with
    }
    
    echo "Fuzzy search terms: " . implode(', ', array_unique($fuzzySearchTerms)) . "\n";
    echo "Search patterns: " . count($searchPatterns) . " patterns generated\n";
    echo "Sample patterns: " . implode(', ', array_slice($searchPatterns, 0, 5)) . "\n";
    echo "\n";
    
    return $fuzzySearchTerms;
}

// Test cases
$testCases = [
    'Kitkat',
    'Kit Kat', 
    'kit kat',
    'KITKAT',
    'kitkat',
    'Hello World',
    'helloworld',
    'Test Product',
    'testproduct'
];

foreach ($testCases as $testCase) {
    testFuzzySearch($testCase);
}

echo "Test completed!\n";
?>
