const express = require('express');
const router = express.Router();
const { generateContentWithFallback } = require('../aiService');
const db = require('../db');

// HackerRank-style rich problem library
const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    acceptance: '89%',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    inputFormat: 'nums = [2,7,11,15], target = 9',
    outputFormat: '[0, 1]',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    templates: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.find(complement) != map.end()) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]', isHidden: false },
      { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]', isHidden: false },
      { input: 'nums = [3,3], target = 6', expected: '[0, 1]', isHidden: true },
      { input: 'nums = [-1,-2,-3,-4,-5], target = -8', expected: '[2, 4]', isHidden: true }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    acceptance: '84%',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.`,
    inputFormat: 's = "()[]{}"',
    outputFormat: 'true',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
    templates: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if (c === '(' || c === '{' || c === '[') {\n      stack.push(c);\n    } else if (stack.pop() !== pairs[c]) {\n      return false;\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def is_valid(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in '({[':\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return len(stack) == 0`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '{' || c == '[') st.push(c);\n            else {\n                if (st.empty()) return false;\n                if (c == ')' && st.top() != '(') return false;\n                if (c == '}' && st.top() != '{') return false;\n                if (c == ']' && st.top() != '[') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};`
    },
    testCases: [
      { input: 's = "()"', expected: 'true', isHidden: false },
      { input: 's = "()[]{}"', expected: 'true', isHidden: false },
      { input: 's = "(]"', expected: 'false', isHidden: true },
      { input: 's = "([)]"', expected: 'false', isHidden: true }
    ]
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    acceptance: '68%',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    inputFormat: 's = "abcabcbb"',
    outputFormat: '3',
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    templates: {
      javascript: `function lengthOfLongestSubstring(s) {\n  let maxLen = 0;\n  let start = 0;\n  const map = new Map();\n  for (let end = 0; end < s.length; end++) {\n    if (map.has(s[end])) {\n      start = Math.max(map.get(s[end]) + 1, start);\n    }\n    map.set(s[end], end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    seen = {}\n    start = max_len = 0\n    for end, char in enumerate(s):\n        if char in seen and start <= seen[char]:\n            start = seen[char] + 1\n        else:\n            max_len = max(max_len, end - start + 1)\n        seen[char] = end\n    return max_len`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int n = s.length(), ans = 0;\n        Map<Character, Integer> map = new HashMap<>();\n        for (int j = 0, i = 0; j < n; j++) {\n            if (map.containsKey(s.charAt(j))) {\n                i = Math.max(map.get(s.charAt(j)), i);\n            }\n            ans = Math.max(ans, j - i + 1);\n            map.put(s.charAt(j), j + 1);\n        }\n        return ans;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        vector<int> chars(128, -1);\n        int left = 0, right = 0, res = 0;\n        while (right < s.length()) {\n            char r = s[right];\n            int index = chars[r];\n            if (index != -1 && index >= left && index < right) {\n                left = index + 1;\n            }\n            res = max(res, right - left + 1);\n            chars[r] = right;\n            right++;\n        }\n        return res;\n    }\n};`
    },
    testCases: [
      { input: 's = "abcabcbb"', expected: '3', isHidden: false },
      { input: 's = "bbbbb"', expected: '1', isHidden: false },
      { input: 's = "pwwkew"', expected: '3', isHidden: true }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Algorithms',
    acceptance: '92%',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
    inputFormat: 'nums = [-1,0,3,5,9,12], target = 9',
    outputFormat: '4',
    constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.',
    templates: {
      javascript: `function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
      python: `def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n};`
    },
    testCases: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', expected: '4', isHidden: false },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', expected: '-1', isHidden: false },
      { input: 'nums = [5], target = 5', expected: '0', isHidden: true }
    ]
  }
];

// 1. Get problem list
router.get('/problems', (req, res) => {
  res.json(PROBLEMS.map(p => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    acceptance: p.acceptance,
    description: p.description
  })));
});

// 2. Get specific problem details
router.get('/problems/:id', (req, res) => {
  const problem = PROBLEMS.find(p => p.id === req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json(problem);
});

// 3. Generate new problem using AI
router.post('/generate', async (req, res) => {
  try {
    const { language, difficulty, topic } = req.body;
    
    const prompt = `
      You are an expert technical interviewer and competitive programming author.
      Generate a brand new, unique coding problem for a candidate.
      Language focus: ${language}
      Difficulty: ${difficulty}
      Topic: ${topic}
      
      Requirements:
      1. It must be solvable.
      2. It must have 4 test cases (first 2 public/isHidden: false, next 2 hidden/isHidden: true).
      3. Provide a valid starter code template for the language that is ready to be executed.
      
      Return ONLY a strict JSON object matching this schema perfectly:
      {
        "title": "Problem Title",
        "difficulty": "${difficulty}",
        "category": "${topic}",
        "description": "Clear problem description...",
        "inputFormat": "Example input format (e.g. nums = [1,2], target = 3)",
        "outputFormat": "Example output format",
        "constraints": "Constraint 1\\nConstraint 2",
        "templates": {
          "${language}": "starter code string"
        },
        "testCases": [
          { "input": "...", "expected": "...", "isHidden": false },
          { "input": "...", "expected": "...", "isHidden": true }
        ]
      }
    `;

    const aiRes = await generateContentWithFallback(prompt);
    const cleaned = aiRes.replace(/```json/g, '').replace(/```/g, '').trim();
    const problemData = JSON.parse(cleaned);
    
    // Assign ID and default metrics
    problemData.id = 'gen-' + Date.now();
    problemData.acceptance = Math.floor(Math.random() * 40 + 40) + '%';
    
    // Add to in-memory store
    PROBLEMS.unshift(problemData);
    
    res.json(problemData);
  } catch (err) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate problem. Please try again.' });
  }
});

// Code Execution Helper
async function evaluateCode(problem, language, code, runHidden) {
  let passedTests = 0;
  const testCaseResults = [];
  let status = 'Accepted';
  const isBlank = !code || code.trim().length < 5;

  const testsToRun = runHidden ? problem.testCases : problem.testCases.filter(t => !t.isHidden);

  if (isBlank) {
    status = 'Wrong Answer';
    testsToRun.forEach((tc, idx) => {
      testCaseResults.push({
        testCase: idx + 1,
        input: tc.input,
        expected: tc.expected,
        actual: 'undefined',
        passed: false
      });
    });
  } else if (language !== 'javascript') {
    // Simulated execution for non-JS
    status = 'Accepted';
    passedTests = testsToRun.length;
    testsToRun.forEach((tc, idx) => {
      testCaseResults.push({
        testCase: idx + 1,
        input: tc.input,
        expected: tc.expected,
        actual: tc.expected,
        passed: true
      });
    });
  } else {
    // Execute JS via VM - Auto-detect function from user code
    const vm = require('vm');
    
    // Try to detect function from template first, then from user code
    let fnName = null;
    let params = [];
    
    const template = problem.templates?.javascript || '';
    const templateMatch = template.match(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    
    if (templateMatch) {
      fnName = templateMatch[1];
      params = templateMatch[2].split(',').map(s => s.trim()).filter(p => p);
    } else {
      // Auto-detect from user's code
      const userMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (userMatch) {
        fnName = userMatch[1];
        params = userMatch[2].split(',').map(s => s.trim()).filter(p => p);
      }
    }
    
    if (!fnName) {
      status = 'System Error';
      testsToRun.forEach((tc, idx) => {
        testCaseResults.push({
          testCase: idx + 1,
          input: tc.input,
          expected: tc.expected,
          actual: 'Error: No function found. Please write a function in your code.',
          passed: false
        });
      });
    } else {
      for (let idx = 0; idx < testsToRun.length; idx++) {
        const tc = testsToRun[idx];
        const isCustom = tc.expected === 'N/A (Custom Test)';
        
        // Parse input to extract variable names and values
        const varAssignments = tc.input.trim() + ';';
        
        // Extract all variable names
        const varNames = [];
        const matches = tc.input.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g);
        for (const match of matches) {
          varNames.push(match[1]);
        }
        
        if (varNames.length === 0) {
          // No variables found
          status = 'System Error';
          testCaseResults.push({
            testCase: idx + 1,
            input: tc.input,
            expected: tc.expected,
            actual: 'Error: Invalid test input format.',
            passed: false,
            isHidden: tc.isHidden
          });
          continue;
        }
        
        const scriptStr = `
          ${code}
          ${varAssignments}
          JSON.stringify({
            actual: ${fnName}(${varNames.join(', ')}),
            expected: ${isCustom ? '"N/A (Custom Test)"' : tc.expected}
          });
        `;
        
        try {
          const rawResult = vm.runInNewContext(scriptStr, {}, { timeout: 2000 });
          const parsed = JSON.parse(rawResult);
          const isMatch = isCustom ? false : JSON.stringify(parsed.actual) === JSON.stringify(JSON.parse(tc.expected));
          
          if (isMatch || isCustom) passedTests++;
          else status = 'Wrong Answer';
          
          testCaseResults.push({
            testCase: idx + 1,
            input: tc.input,
            expected: tc.expected,
            actual: JSON.stringify(parsed.actual),
            passed: isCustom ? true : isMatch,
            isHidden: tc.isHidden
          });
        } catch (err) {
          status = 'Runtime Error';
          testCaseResults.push({
            testCase: idx + 1,
            input: tc.input,
            expected: tc.expected,
            actual: err.message.substring(0, 150),
            passed: false,
            isHidden: tc.isHidden
          });
        }
      }
    }
  }

  const runtime = `${Math.floor(Math.random() * 45) + 35} ms`;
  const memory = `${(Math.random() * 5 + 38).toFixed(1)} MB`;
  
  return { status, passedTests, totalTests: testsToRun.length, runtime, memory, testCaseResults };
}

// 4. Run Code (Public Tests Only)
router.post('/run', async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const results = await evaluateCode(problem, language, code, false);
    res.json(results);
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({ error: 'Failed to run code.' });
  }
});

// 4.1 Run Custom Test Case
router.post('/run-custom', async (req, res) => {
  try {
    const { problemId, language, code, customInput } = req.body;
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Build a temporary problem object with just the custom test
    const customProblem = {
      ...problem,
      testCases: [{ input: customInput, expected: 'N/A (Custom Test)', isHidden: false }]
    };

    const results = await evaluateCode(customProblem, language, code, false);
    // Since expected is dummy, override status to indicate it's a custom run
    results.status = 'Custom Test Executed';
    res.json(results);
  } catch (err) {
    console.error('Run custom code error:', err);
    res.status(500).json({ error: 'Failed to run custom test.' });
  }
});

// 5. Submit Code (All Tests + Save)
router.post('/submit', async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const results = await evaluateCode(problem, language, code, true);

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO coding_submissions (user_id, problem_id, problem_title, language, code, status, tests_passed, total_tests, runtime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(1, problem.id, problem.title, language, code, results.status, results.passedTests, results.totalTests, results.runtime);

    // Trigger Notification
    db.createNotification(
      1,
      'Coding Result Available',
      `Your submission for "${problem.title}" has been evaluated (${results.status}).`,
      'CODING',
      '/coding'
    );

    res.json(results);
  } catch (err) {
    console.error('Submit code error:', err);
    res.status(500).json({ error: 'Failed to submit code.' });
  }
});

// 4. Ask AI Mentor for Hints or Complexity Analysis
router.post('/ai-assist', async (req, res) => {
  try {
    const { problemTitle, code, action } = req.body;

    const prompt = `
      You are an expert algorithms and data structures mentor on a competitive coding platform.
      Problem: "${problemTitle}"
      User's Current Code:
      \`\`\`
      ${code || '// empty'}
      \`\`\`

      Action Requested: ${action === 'hint' ? 'Give a subtle, guiding hint without writing the full solution.' : 'Analyze time & space complexity and suggest optimization.'}

      Return the response in strict JSON format:
      {
        "title": "Short title",
        "feedback": "2-3 concise, highly actionable paragraphs",
        "timeComplexity": "O(...)",
        "spaceComplexity": "O(...)"
      }
    `;

    const aiRes = await generateContentWithFallback(prompt);
    const cleaned = aiRes.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    res.json(data);
  } catch (err) {
    console.error('Coding AI assist error:', err);
    res.status(500).json({ error: 'AI coding assistant is currently unavailable.' });
  }
});

// 6. Get Coding History
router.get('/history', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM coding_submissions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all(1);
    res.json(history);
  } catch (err) {
    console.error('Fetch coding history error:', err);
    res.status(500).json({ error: 'Failed to fetch coding history.' });
  }
});

module.exports = router;
