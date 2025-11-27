import mongoose from 'mongoose';
import { User } from '@/server/models';
import { Question } from '@/server/models';
import { database } from '@/server/utils/database';
import { logger } from '@/server/utils/logger';

const sampleQuestions = [
  {
    title: '两数之和',
    description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

示例 1：
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1]

示例 2：
输入：nums = [3,2,4], target = 6
输出：[1,2]

示例 3：
输入：nums = [3,3], target = 6
输出：[0,1]

提示：
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- 只会存在一个有效答案`,
    category: 'algorithms',
    difficulty: 'easy',
    type: 'coding',
    tags: ['数组', '哈希表'],
    timeLimit: 30,
    points: 10,
    hints: [
      '可以使用暴力枚举的方法，时间复杂度是O(n^2)',
      '可以使用哈希表来存储已经遍历过的元素，这样可以将时间复杂度降低到O(n)'
    ],
    solution: {
      explanation: '使用哈希表来存储已经遍历过的元素和它们的索引。对于每个元素，我们检查target减去当前元素的结果是否已经在哈希表中。如果存在，我们就找到了答案。这种方法的时间复杂度是O(n)，空间复杂度也是O(n)。',
      code: {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
};`,
        python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        
        for i, num in enumerate(nums):
            complement = target - num
            
            if complement in hashmap:
                return [hashmap[complement], i]
            
            hashmap[num] = i
        
        return []`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return new int[]{};
    }
}`
      },
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      approach: '哈希表'
    },
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1],
        description: '基本测试用例'
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2],
        description: '中间元素相加'
      },
      {
        input: { nums: [3, 3], target: 6 },
        expectedOutput: [0, 1],
        description: '重复元素'
      }
    ],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook'],
    frequency: 95
  },
  {
    title: '反转链表',
    description: `给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。

示例 1：
输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]

示例 2：
输入：head = [1,2]
输出：[2,1]

示例 3：
输入：head = []
输出：[]

提示：
- 链表中节点的数目范围是 [0, 5000]
- -5000 <= Node.val <= 5000

进阶：链表可以选用迭代或递归方式完成反转。你能否用两种方法解决这道题？`,
    category: 'data-structures',
    difficulty: 'medium',
    type: 'coding',
    tags: ['链表', '递归'],
    timeLimit: 45,
    points: 20,
    hints: [
      '可以使用迭代的方式，维护三个指针：prev、curr、next',
      '也可以使用递归的方式，先反转后面的链表，再处理当前节点'
    ],
    solution: {
      explanation: '迭代方法：我们使用三个指针prev、curr和next。prev指向前一个节点，curr指向当前节点，next指向下一个节点。每次迭代，我们将curr的next指向prev，然后将三个指针向后移动一位。这种方法的空间复杂度是O(1)。',
      code: {
        javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    
    return prev;
};`,
        python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        current = head
        
        while current is not None:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        
        return prev`,
        java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode current = head;
        
        while (current != null) {
            ListNode nextTemp = current.next;
            current.next = prev;
            prev = current;
            current = nextTemp;
        }
        
        return prev;
    }
}`
      },
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      approach: '迭代'
    },
    testCases: [
      {
        input: { head: [1, 2, 3, 4, 5] },
        expectedOutput: [5, 4, 3, 2, 1],
        description: '基本测试用例'
      },
      {
        input: { head: [1, 2] },
        expectedOutput: [2, 1],
        description: '两个节点'
      },
      {
        input: { head: [] },
        expectedOutput: [],
        description: '空链表'
      }
    ],
    companies: ['Google', 'Microsoft', 'Amazon', 'Apple'],
    frequency: 88
  },
  {
    title: '解释RESTful API的设计原则',
    description: `请详细解释RESTful API的设计原则，包括：
1. REST的基本概念和架构风格
2. 资源（Resource）的定义和表示
3. HTTP方法的使用规范
4. 状态码的正确使用
5. 版本控制策略
6. 安全性考虑

请结合具体的例子来说明你的理解。`,
    category: 'web-development',
    difficulty: 'medium',
    type: 'short-answer',
    tags: ['API', 'REST', 'HTTP', '架构'],
    timeLimit: 60,
    points: 25,
    hints: [
      '从客户端-服务器架构开始思考',
      '考虑无状态性（Statelessness）的重要性',
      '想想如何设计清晰的URL结构'
    ],
    companies: ['Amazon', 'Google', 'Microsoft', 'Netflix'],
    frequency: 75
  }
];

async function seedDatabase() {
  try {
    // Connect to database
    await database.connect();
    logger.info('Connected to database');

    // Clear existing data
    await Question.deleteMany({});
    await User.deleteMany({});
    logger.info('Cleared existing data');

    // Insert sample questions
    const questions = await Question.insertMany(sampleQuestions);
    logger.info(`Inserted ${questions.length} sample questions`);

    // Create a sample user
    const sampleUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      profile: {
        firstName: '测试',
        lastName: '用户',
        experience: 'mid',
        targetRoles: ['前端工程师', '全栈工程师'],
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
      },
      preferences: {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        notifications: {
          email: true,
          push: true,
          interviewReminders: true,
          progressUpdates: true,
        },
        interviewSettings: {
          defaultDuration: 60,
          defaultDifficulty: 'medium',
          defaultInterviewType: 'technical',
          voiceEnabled: true,
          cameraEnabled: false,
        },
      },
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        features: ['basic_interviews', 'question_bank'],
      },
    });

    await sampleUser.save();
    logger.info('Created sample user');

    logger.info('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();