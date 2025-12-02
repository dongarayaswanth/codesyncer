/*
Title: Root_equals_sum_of_childern_2025-12-02T12-39-55-274Z.py
Description: Return true if the value of the root is equal to the sum of the values of its two children, or false otherwise.
Date: 12/2/2025, 6:11:03 PM
*/

# Definition for a binary tree node.
class TreeNode:
     def __init__(self, val=0, left=None, right=None):
         self.val = val
         self.left = left
         self.right = right
class Solution:
    def checkTree(self, root: Optional[TreeNode]) -> bool:
        return root.val == root.left.val + root.right.val

root = TreeNode(10)
root.left = TreeNode(4)
root.right = TreeNode(6)
sol = Solution()
print(sol.checkTree(root))
        