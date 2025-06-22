import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeRewardData } from "@/hooks/use-badge-reward";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BadgeRewardNotificationProps {
  isVisible: boolean;
  rewardData: BadgeRewardData | null;
  onClose: () => void;
  pendingCount?: number;
}

export function BadgeRewardNotification({
  isVisible,
  rewardData,
  onClose,
  pendingCount = 0,
}: BadgeRewardNotificationProps) {
  if (!rewardData) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative mx-4 max-w-md rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-lg bg-white p-6 text-center">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Badge earned header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                className="mb-4"
              >
                <div className="text-4xl">🏆</div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Badge Earned!
                </h2>
              </motion.div>

              {/* Badge image and info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mb-4"
              >
                {rewardData.imageUrl && (
                  <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                    <img
                      src={rewardData.imageUrl}
                      alt={rewardData.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-800">
                  {rewardData.name}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {rewardData.description}
                </p>

                {rewardData.expBonus > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                  >
                    +{rewardData.expBonus} XP Bonus!
                  </motion.div>
                )}
              </motion.div>

              {/* Badge type indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mb-4"
              >
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {rewardData.badgeType.replace("_", " ").toUpperCase()}
                </span>
              </motion.div>

              {/* Pending badges indicator */}
              {pendingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="mb-4 text-sm text-gray-500"
                >
                  {pendingCount} more badge{pendingCount > 1 ? "s" : ""} coming
                  up!
                </motion.div>
              )}

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                >
                  {pendingCount > 0 ? "Next Badge" : "Awesome!"}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Celebration particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: "50vw",
                  y: "50vh",
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                  x: `${50 + (Math.random() - 0.5) * 100}vw`,
                  y: `${50 + (Math.random() - 0.5) * 100}vh`,
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute h-2 w-2 rounded-full bg-yellow-400"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
