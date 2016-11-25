module Carto
  module Api
    class SnapshotPresenter
      def initialize(snapshot)
        @snapshot = snapshot
      end

      def self.collection_to_hash(states)
        states.map do |state|
          SnapshotPresenter.new(state).to_hash
        end
      end

      def to_hash
        {
          id: @snapshot.id,
          created_at: @snapshot.created_at,
          updated_at: @snapshot.updated_at,
          state: @snapshot.json,
          user: Carto::Api::UserPresenter.new(@snapshot.user).to_public_poro
        }
      end
    end
  end
end